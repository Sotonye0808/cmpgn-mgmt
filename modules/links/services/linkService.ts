import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize } from "@/lib/utils/serialize";
import { generateSlug } from "@/lib/utils/slug";
import { CACHE_TTL_CAMPAIGN_LIST as CACHE_TTL_SHORT } from "@/lib/constants";

// View model: SmartLink enriched with campaign title (lookup-only, not stored)
export type SmartLinkView = SmartLink & { campaignTitle?: string };

// Service inputs/outputs
interface GenerateLinkInput {
    userId: string;
    campaignId: string;
    customAlias?: string;
}

interface GetLinksOptions {
    userId?: string;
    campaignId?: string;
    page?: number;
    pageSize?: number;
}

interface IncrementClickInput {
    slug: string;
    referrerId?: string;
    ipAddress?: string;
    userAgent?: string;
    cookieSeen?: boolean;
}

/** djb2-style non-cryptographic hash — sufficient for click dedup fingerprinting */
function simpleHash(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
}

interface LogEventInput {
    linkId: string;
    type: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
}

// ─── Generate or return existing link (idempotent) ────────────────────────────
export async function generateLink(input: GenerateLinkInput): Promise<SmartLink> {
    const { userId, campaignId, customAlias } = input;

    // Check if user already has a link for this campaign (compound unique)
    const existing = await prisma.smartLink.findUnique({
        where: { userId_campaignId: { userId, campaignId } },
    });
    if (existing) return serialize<SmartLink>(existing);

    // Ensure campaign exists and is active
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "ACTIVE") throw new Error("Campaign is not active");

    // Generate unique slug
    let slug = customAlias ?? generateSlug();
    let slugTaken = !!(await prisma.smartLink.findUnique({ where: { slug } }));
    let retries = 0;
    while (slugTaken && retries < 5) {
        slug = generateSlug();
        slugTaken = !!(await prisma.smartLink.findUnique({ where: { slug } }));
        retries++;
    }
    if (slugTaken) throw new Error("Could not generate unique slug. Try again.");

    const newLink = await prisma.smartLink.create({
        data: {
            slug,
            userId,
            campaignId,
            originalUrl: campaign.ctaUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/campaigns/${campaignId}`,
            clickCount: 0,
            uniqueClickCount: 0,
            conversionCount: 0,
            isActive: true,
            isExpired: false,
            expiresAt: campaign.endDate ?? undefined,
        },
    });

    await redis.invalidatePattern(`smartlinks:user:${userId}`);
    return serialize<SmartLink>(newLink);
}

// ─── Get link by slug ──────────────────────────────────────────────────────────
export async function getLinkBySlug(slug: string): Promise<SmartLink | null> {
    const cacheKey = `smartlink:slug:${slug}`;
    const cached = await redis.get<SmartLink>(cacheKey);
    if (cached) return cached;

    const link = await prisma.smartLink.findUnique({ where: { slug } });
    if (!link) return null;

    const serialized = serialize<SmartLink>(link);
    await redis.set(cacheKey, serialized, CACHE_TTL_SHORT);
    return serialized;
}

// ─── Get links (by user or campaign) ────────────────────────────────────────
export async function getLinksByUser(userId: string): Promise<SmartLinkView[]> {
    const cacheKey = `smartlinks:user:${userId}`;
    const cached = await redis.get<SmartLinkView[]>(cacheKey);
    if (cached) return cached;

    const links = await prisma.smartLink.findMany({
        where: { userId },
        include: { campaign: { select: { title: true } } },
    });

    const views: SmartLinkView[] = links.map((l) => {
        const { campaign: campaignRel, ...rest } = l;
        return serialize<SmartLinkView>({
            ...rest,
            campaignTitle: campaignRel?.title,
        });
    });

    await redis.set(cacheKey, views, CACHE_TTL_SHORT);
    return views;
}

export async function getLinksByCampaign(options: GetLinksOptions) {
    const { campaignId, page = 1, pageSize = 10 } = options;

    const where = campaignId ? { campaignId } : {};
    const [all, total] = await Promise.all([
        prisma.smartLink.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { campaign: { select: { title: true } } },
        }),
        prisma.smartLink.count({ where }),
    ]);

    const data: SmartLinkView[] = all.map((l) => {
        const { campaign: campaignRel, ...rest } = l;
        return serialize<SmartLinkView>({
            ...rest,
            campaignTitle: campaignRel?.title,
        });
    });

    return {
        data,
        meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
}

// ─── Increment click + log event ──────────────────────────────────────────────
export async function incrementClick(input: IncrementClickInput): Promise<SmartLink> {
    const { slug, ipAddress, userAgent, cookieSeen } = input;

    const link = await prisma.smartLink.findUnique({ where: { slug } });
    if (!link) throw new Error("Link not found");
    if (!link.isActive) throw new Error("Link is no longer active");
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        throw new Error("Link has expired");
    }

    // Fingerprint-based unique click deduplication (24h TTL)
    const fingerprint = simpleHash((ipAddress ?? "") + (userAgent ?? ""));
    const seenKey = `seen:${link.id}:${fingerprint}`;
    const alreadySeen = !!(await redis.get<boolean>(seenKey)) || !!cookieSeen;
    if (!alreadySeen) {
        await redis.set(seenKey, true, 86_400_000); // 24h in ms
    }

    const updatedLink = await prisma.smartLink.update({
        where: { id: link.id },
        data: {
            clickCount: { increment: 1 },
            uniqueClickCount: alreadySeen ? undefined : { increment: 1 },
        },
    });

    await redis.del(`smartlink:slug:${slug}`);

    // Distribute click points via transaction
    await prisma.$transaction(async (tx) => {
        await tx.pointsLedgerEntry.create({
            data: {
                userId: link.userId,
                campaignId: link.campaignId,
                type: "IMPACT" as never,
                value: 1,
                description: "Smart link click received",
            },
        });
        await redis.del(`points:summary:${link.userId}`);
    });

    return serialize<SmartLink>(updatedLink);
}

// ─── Log link event ────────────────────────────────────────────────────────────
export async function logLinkEvent(input: LogEventInput): Promise<LinkEvent> {
    const event = await prisma.linkEvent.create({
        data: {
            linkId: input.linkId,
            eventType: input.type as never,
            userId: input.userId,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            referrer: input.referrer,
            country: input.country,
        },
    });
    return serialize<LinkEvent>(event);
}

// ─── Expire / deactivate link ──────────────────────────────────────────────────
export async function deactivateLink(id: string): Promise<SmartLink> {
    const link = await prisma.smartLink.update({
        where: { id },
        data: { isActive: false },
    });
    await redis.invalidatePattern("smartlink:");
    return serialize<SmartLink>(link);
}
