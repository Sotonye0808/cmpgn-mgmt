import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { generateSlug } from "@/lib/utils/slug";
import { CACHE_TTL_CAMPAIGN_LIST as CACHE_TTL_SHORT } from "@/lib/constants";

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

    // Check if user already has a link for this campaign
    const existing = mockDb.smartLinks.findMany({ where: { userId, campaignId } })[0] ?? null;
    if (existing) return existing;

    // Ensure campaign exists and is active
    const campaign = await mockDb.campaigns.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "ACTIVE") throw new Error("Campaign is not active");

    // Generate unique slug
    let slug = customAlias ?? generateSlug();
    let slugTaken = !!(await mockDb.smartLinks.findUnique({ where: { slug } }));
    let retries = 0;
    while (slugTaken && retries < 5) {
        slug = generateSlug();
        slugTaken = !!(await mockDb.smartLinks.findUnique({ where: { slug } }));
        retries++;
    }
    if (slugTaken) throw new Error("Could not generate unique slug. Try again.");

    const now = new Date().toISOString();
    const newLink: SmartLink = {
        id: crypto.randomUUID(),
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
        createdAt: now,
        updatedAt: now,
    };

    await mockDb.smartLinks.create({ data: newLink });
    mockCache.invalidatePattern(`smartlinks:user:${userId}`);
    mockDb.emit("smartLinks:changed");

    return newLink;
}

// ─── Get link by slug ──────────────────────────────────────────────────────────
export async function getLinkBySlug(slug: string): Promise<SmartLink | null> {
    const cacheKey = `smartlink:slug:${slug}`;
    const cached = mockCache.get<SmartLink>(cacheKey);
    if (cached) return cached;

    const link = await mockDb.smartLinks.findUnique({ where: { slug } });
    if (link) mockCache.set(cacheKey, link, CACHE_TTL_SHORT);
    return link ?? null;
}

// ─── Get links (by user or campaign) ────────────────────────────────────────
export async function getLinksByUser(userId: string): Promise<SmartLink[]> {
    const cacheKey = `smartlinks:user:${userId}`;
    const cached = mockCache.get<SmartLink[]>(cacheKey);
    if (cached) return cached;

    const links = await mockDb.smartLinks.findMany({ where: { userId } });
    mockCache.set(cacheKey, links, CACHE_TTL_SHORT);
    return links;
}

export async function getLinksByCampaign(options: GetLinksOptions) {
    const { campaignId, page = 1, pageSize = 10 } = options;
    const all = await mockDb.smartLinks.findMany(campaignId ? { where: { campaignId } } : {});
    const total = all.length;
    const start = (page - 1) * pageSize;
    const data = all.slice(start, start + pageSize);
    return {
        data,
        meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
}

// ─── Increment click + log event ──────────────────────────────────────────────
export async function incrementClick(input: IncrementClickInput): Promise<SmartLink> {
    const { slug } = input;

    const link = await mockDb.smartLinks.findUnique({ where: { slug } });
    if (!link) throw new Error("Link not found");
    if (!link.isActive) throw new Error("Link is no longer active");
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        throw new Error("Link has expired");
    }

    const updatedLink = await mockDb.smartLinks.update({
        where: { id: link.id },
        data: {
            clickCount: link.clickCount + 1,
            uniqueClickCount: link.uniqueClickCount + 1, // simplified: no real dedup in mock
            updatedAt: new Date().toISOString(),
        },
    });
    if (!updatedLink) throw new Error("Failed to update link");

    mockCache.del(`smartlink:slug:${slug}`);
    mockDb.emit("smartLinks:changed");

    // Distribute click points via transaction
    await mockDb.transaction(async (tx) => {
        const pointEntry = {
            id: crypto.randomUUID(),
            userId: link.userId,
            campaignId: link.campaignId,
            type: "IMPACT" as PointsLedgerEntry["type"],
            value: 1,
            description: "Smart link click received",
            createdAt: new Date().toISOString(),
        };
        await tx.pointsLedger.create({ data: pointEntry });
        mockCache.del(`points:summary:${link.userId}`);
        mockDb.emit("pointsLedger:changed");
    });

    return updatedLink;
}

// ─── Log link event ────────────────────────────────────────────────────────────
export async function logLinkEvent(input: LogEventInput): Promise<LinkEvent> {
    const event: LinkEvent = {
        id: crypto.randomUUID(),
        linkId: input.linkId,
        eventType: input.type as unknown as LinkEventType,
        userId: input.userId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        referrer: input.referrer,
        country: input.country,
        createdAt: new Date().toISOString(),
    };
    await mockDb.linkEvents.create({ data: event });
    mockDb.emit("linkEvents:changed");
    return event;
}

// ─── Expire / deactivate link ──────────────────────────────────────────────────
export async function deactivateLink(id: string): Promise<SmartLink> {
    const link = await mockDb.smartLinks.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date().toISOString() },
    });
    if (!link) throw new Error("Link not found");
    mockCache.invalidatePattern(`smartlink:`);
    mockDb.emit("smartLinks:changed");
    return link;
}
