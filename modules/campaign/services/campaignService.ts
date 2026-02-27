import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { CACHE_TTL_CAMPAIGN_LIST, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResponse } from "@/types/api";

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
    const cached = mockCache.get<PaginatedResponse<Campaign>>(cacheKey);
    if (cached) return cached;

    let all = mockDb.campaigns.findMany({
        orderBy: { createdAt: "desc" },
    });

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

    mockCache.set(cacheKey, result, CACHE_TTL_CAMPAIGN_LIST);
    return result;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const cacheKey = `campaigns:detail:${id}`;
    const cached = mockCache.get<Campaign>(cacheKey);
    if (cached) return cached;

    const campaign = mockDb.campaigns.findUnique({ where: { id } });
    if (campaign) mockCache.set(cacheKey, campaign, CACHE_TTL_CAMPAIGN_LIST);
    return campaign;
}

export async function createCampaign(
    input: CreateCampaignInput,
    createdById: string
): Promise<Campaign> {
    const now = new Date().toISOString();
    const campaign = mockDb.campaigns.create({
        data: {
            ...input,
            createdById,
            status: input.publishImmediately
                ? ("ACTIVE" as unknown as CampaignStatus)
                : ("DRAFT" as unknown as CampaignStatus),
            viewCount: 0,
            clickCount: 0,
            shareCount: 0,
            likeCount: 0,
            participantCount: 0,
            goalCurrent: 0,
            publishedAt: input.publishImmediately ? now : undefined,
            media: input.media ?? [],
            createdAt: now,
            updatedAt: now,
        },
    });

    mockCache.invalidatePattern("campaigns:list");
    mockDb.emit("campaigns:changed");
    return campaign;
}

export async function updateCampaign(
    id: string,
    input: UpdateCampaignInput
): Promise<Campaign | null> {
    const existing = mockDb.campaigns.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = mockDb.campaigns.update({
        where: { id },
        data: { ...input, updatedAt: new Date().toISOString() },
    });

    mockCache.del(`campaigns:detail:${id}`);
    mockCache.invalidatePattern("campaigns:list");
    mockDb.emit("campaigns:changed");
    return updated;
}

export async function joinCampaign(
    userId: string,
    campaignId: string
): Promise<CampaignParticipation> {
    const existing = mockDb.participations.findUnique({
        where: { id: `${userId}-${campaignId}` },
    });
    // Check by userId + campaignId combination
    const alreadyJoined = mockDb.participations.findMany({}).find(
        (p) => p.userId === userId && p.campaignId === campaignId
    );
    if (alreadyJoined) return alreadyJoined;

    const participation = await mockDb.transaction(async (tx) => {
        const part = tx.participations.create({
            data: {
                userId,
                campaignId,
                joinedAt: new Date().toISOString(),
            },
        });

        // Increment participant count
        const campaign = tx.campaigns.findUnique({ where: { id: campaignId } });
        if (campaign) {
            tx.campaigns.update({
                where: { id: campaignId },
                data: {
                    participantCount: (campaign.participantCount ?? 0) + 1,
                    updatedAt: new Date().toISOString(),
                },
            });
        }

        return part;
    });

    mockCache.del(`campaigns:detail:${campaignId}`);
    mockCache.invalidatePattern("campaigns:list");
    mockDb.emit("campaigns:changed");
    mockDb.emit("participations:changed");

    // Supress unused variable warning
    void existing;
    return participation;
}

export async function getCampaignParticipants(
    campaignId: string,
    pagination: { page: number; pageSize: number }
): Promise<PaginatedResponse<CampaignParticipation>> {
    const all = mockDb.participations.findMany({ where: { campaignId } });
    const total = all.length;
    const skip = (pagination.page - 1) * pagination.pageSize;
    const data = all.slice(skip, skip + pagination.pageSize);
    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
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
}

export async function getCampaignStats(campaignId: string) {
    const campaign = mockDb.campaigns.findUnique({ where: { id: campaignId } });
    if (!campaign) return null;

    const participantCount = mockDb.participations.count({ where: { campaignId } });
    const smartLinkCount = mockDb.smartLinks.count({ where: { campaignId } });

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
    const now = new Date().toISOString();
    let count = 0;

    const activeCampaigns = mockDb.campaigns.findMany({
        where: { status: "ACTIVE" as unknown as CampaignStatus },
    });

    for (const campaign of activeCampaigns) {
        if (campaign.endDate && campaign.endDate < now) {
            mockDb.campaigns.update({
                where: { id: campaign.id },
                data: {
                    status: "COMPLETED" as unknown as CampaignStatus,
                    updatedAt: now,
                },
            });
            count++;
        }
    }

    if (count > 0) {
        mockCache.invalidatePattern("campaigns:");
        mockDb.emit("campaigns:changed");
    }
    return count;
}
