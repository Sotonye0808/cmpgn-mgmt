import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redis } from "@/lib/redis";
import { serialize, serializeArray } from "@/lib/utils/serialize";
import { CACHE_TTL_CAMPAIGN_LIST, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResponse } from "@/types/api";

// ─── Audit Helper ─────────────────────────────────────────────────────────────

async function recordAudit(
    campaignId: string,
    actorId: string,
    actorRole: string,
    eventType: string,
    opts?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        note?: string;
    }
) {
    await prisma.campaignAuditEvent.create({
        data: {
            campaignId,
            actorId,
            actorRole,
            eventType: eventType as never,
            before: (opts?.before ?? undefined) as Prisma.InputJsonValue | undefined,
            after: (opts?.after ?? undefined) as Prisma.InputJsonValue | undefined,
            note: opts?.note,
        },
    });
}

function applyCampaignFilters(campaign: Campaign, filters: CampaignFilters): boolean {
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.goalType && campaign.goalType !== filters.goalType) return false;
    if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
            !campaign.title.toLowerCase().includes(q) &&
            !campaign.description.toLowerCase().includes(q)
        )
            return false;
    }
    return true;
}

export async function listCampaigns(
    filters: CampaignFilters = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: DEFAULT_PAGE_SIZE },
    user?: AuthUser
): Promise<PaginatedResponse<Campaign>> {
    const cacheKey = `campaigns:list:${JSON.stringify(filters)}:p${pagination.page}:ps${pagination.pageSize}`;
    const cached = await redis.get<PaginatedResponse<Campaign>>(cacheKey);
    if (cached) return cached;

    const rawAll = await prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
    });

    let all = serializeArray<Campaign>(rawAll);

    // Non-admins only see non-DRAFT campaigns
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
        all = all.filter((c) => c.status !== "DRAFT");
    }

    all = all.filter((c) => applyCampaignFilters(c, filters));

    const total = all.length;
    const skip = (pagination.page - 1) * pagination.pageSize;
    const data = all.slice(skip, skip + pagination.pageSize);
    const totalPages = Math.ceil(total / pagination.pageSize);

    const result: PaginatedResponse<Campaign> = {
        success: true,
        data,
        pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        },
    };

    await redis.set(cacheKey, result, CACHE_TTL_CAMPAIGN_LIST);
    return result;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const cacheKey = `campaigns:detail:${id}`;
    const cached = await redis.get<Campaign>(cacheKey);
    if (cached) return cached;

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return null;

    const serialized = serialize<Campaign>(campaign);
    await redis.set(cacheKey, serialized, CACHE_TTL_CAMPAIGN_LIST);
    return serialized;
}

export async function createCampaign(
    input: CreateCampaignInput,
    createdById: string
): Promise<Campaign> {
    const now = new Date();
    const campaign = await prisma.campaign.create({
        data: {
            title: input.title,
            description: input.description,
            content: input.content,
            media: (input.media ?? []) as never,
            mediaType: input.mediaType as never,
            mediaUrl: input.mediaUrl,
            thumbnailUrl: input.thumbnailUrl,
            ctaText: input.ctaText,
            ctaUrl: input.ctaUrl,
            createdById,
            status: input.publishImmediately ? "ACTIVE" as never : "DRAFT" as never,
            goalType: input.goalType as never,
            goalTarget: input.goalTarget,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            targetAudience: input.targetAudience ?? [],
            publishedAt: input.publishImmediately ? now : undefined,
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            metaImage: input.metaImage,
            isMegaCampaign: input.isMegaCampaign,
            parentCampaignId: input.parentCampaignId,
            viewCount: 0,
            clickCount: 0,
            shareCount: 0,
            likeCount: 0,
            participantCount: 0,
            goalCurrent: 0,
        },
    });

    await redis.invalidatePattern("campaigns:list");

    await recordAudit(campaign.id, createdById, "UNKNOWN", "CREATED", {
        after: { title: campaign.title, status: campaign.status as string },
        note: `Campaign "${campaign.title}" created`,
    });

    return serialize<Campaign>(campaign);
}

export async function updateCampaign(
    id: string,
    input: UpdateCampaignInput
): Promise<Campaign | null> {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) return null;

    // Build data object, converting date strings to Date objects
    const data: Record<string, unknown> = { ...input };
    if (input.startDate) data.startDate = new Date(input.startDate);
    if (input.endDate) data.endDate = new Date(input.endDate);
    if (input.media) data.media = input.media as never;
    delete data.publishImmediately;

    const updated = await prisma.campaign.update({
        where: { id },
        data: data as never,
    });

    // Detect status change vs field update
    if (input.status && input.status !== (existing.status as unknown as CampaignStatus)) {
        await recordAudit(id, "system", "SYSTEM", "STATUS_CHANGED", {
            before: { status: existing.status as string },
            after: { status: input.status as string },
            note: `Status changed from ${existing.status} to ${input.status}`,
        });
    } else {
        const changedFields = Object.keys(input).filter(
            (k) => (input as unknown as Record<string, unknown>)[k] !== (existing as unknown as Record<string, unknown>)[k]
        );
        if (changedFields.length > 0) {
            const before: Record<string, unknown> = {};
            const after: Record<string, unknown> = {};
            for (const k of changedFields) {
                before[k] = (existing as unknown as Record<string, unknown>)[k];
                after[k] = (input as unknown as Record<string, unknown>)[k];
            }
            await recordAudit(id, "system", "SYSTEM", "FIELDS_UPDATED", {
                before,
                after,
                note: `Fields updated: ${changedFields.join(", ")}`,
            });
        }
    }

    await redis.del(`campaigns:detail:${id}`);
    await redis.invalidatePattern("campaigns:list");
    return serialize<Campaign>(updated);
}

export async function joinCampaign(
    userId: string,
    campaignId: string
): Promise<CampaignParticipation> {
    // Check if already joined (compound unique)
    const alreadyJoined = await prisma.campaignParticipation.findUnique({
        where: { userId_campaignId: { userId, campaignId } },
    });
    if (alreadyJoined) return serialize<CampaignParticipation>(alreadyJoined);

    const participation = await prisma.$transaction(async (tx) => {
        const part = await tx.campaignParticipation.create({
            data: { userId, campaignId },
        });

        // Increment participant count
        await tx.campaign.update({
            where: { id: campaignId },
            data: { participantCount: { increment: 1 } },
        });

        return part;
    });

    await redis.del(`campaigns:detail:${campaignId}`);
    await redis.invalidatePattern("campaigns:list");

    await recordAudit(campaignId, userId, "USER", "PARTICIPANT_JOINED", {
        note: `User ${userId} joined campaign`,
    });

    return serialize<CampaignParticipation>(participation);
}

export async function getCampaignParticipants(
    campaignId: string,
    pagination: { page: number; pageSize: number }
): Promise<PaginatedResponse<CampaignParticipation>> {
    const [data, total] = await Promise.all([
        prisma.campaignParticipation.findMany({
            where: { campaignId },
            skip: (pagination.page - 1) * pagination.pageSize,
            take: pagination.pageSize,
        }),
        prisma.campaignParticipation.count({ where: { campaignId } }),
    ]);

    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
        success: true,
        data: serializeArray<CampaignParticipation>(data),
        pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        },
    };
}

export async function getCampaignStats(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return null;

    const [participantCount, smartLinkCount] = await Promise.all([
        prisma.campaignParticipation.count({ where: { campaignId } }),
        prisma.smartLink.count({ where: { campaignId } }),
    ]);

    return {
        campaignId,
        viewCount: campaign.viewCount,
        clickCount: campaign.clickCount,
        shareCount: campaign.shareCount,
        participantCount,
        smartLinkCount,
        goalCurrent: campaign.goalCurrent ?? 0,
        goalTarget: campaign.goalTarget ?? 0,
        goalPercent:
            campaign.goalTarget
                ? Math.round(((campaign.goalCurrent ?? 0) / campaign.goalTarget) * 100)
                : 0,
    };
}

export async function expireStale(): Promise<number> {
    const now = new Date();

    const result = await prisma.campaign.updateMany({
        where: {
            status: "ACTIVE" as never,
            endDate: { lt: now },
        },
        data: { status: "COMPLETED" as never },
    });

    if (result.count > 0) {
        await redis.invalidatePattern("campaigns:");
    }
    return result.count;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function getCampaignAuditLog(
    campaignId: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedResponse<CampaignAuditEvent & { actorName?: string }>> {
    const [rawData, total] = await Promise.all([
        prisma.campaignAuditEvent.findMany({
            where: { campaignId },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { actor: { select: { firstName: true, lastName: true } } },
        }),
        prisma.campaignAuditEvent.count({ where: { campaignId } }),
    ]);

    const data = rawData.map((event) => ({
        id: event.id,
        campaignId: event.campaignId,
        actorId: event.actorId,
        actorRole: event.actorRole,
        eventType: event.eventType as unknown as CampaignAuditEventType,
        before: event.before as Record<string, unknown> | undefined,
        after: event.after as Record<string, unknown> | undefined,
        note: event.note ?? undefined,
        createdAt: event.createdAt.toISOString(),
        actorName: event.actor
            ? `${event.actor.firstName} ${event.actor.lastName}`
            : event.actorId,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return {
        success: true,
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/** Public recordAudit for use by other services (e.g., donationService) */
export { recordAudit as recordCampaignAudit };
