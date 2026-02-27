import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import {
    CACHE_TTL_DONATIONS,
    DEFAULT_PAGE_SIZE,
    POINTS_CONFIG,
} from "@/lib/constants";
import { nanoid } from "nanoid";

// ─── Record Donation ──────────────────────────────────────────────────────────

export async function recordDonation(
    userId: string,
    input: CreateDonationInput
): Promise<Donation> {
    const campaign = mockDb.campaigns.findUnique({ where: { id: input.campaignId } });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== ("ACTIVE" as unknown as CampaignStatus))
        throw new Error("Campaign is not active");
    if (input.amount <= 0) throw new Error("Donation amount must be positive");

    let donation!: Donation;

    await mockDb.transaction(async (tx) => {
        donation = tx.donations.create({
            data: {
                id: nanoid(),
                userId,
                campaignId: input.campaignId,
                amount: input.amount,
                currency: input.currency ?? "NGN",
                status: "COMPLETED" as unknown as DonationStatus,
                reference: `DON-${nanoid(8).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });

        // Award Leadership Points for donating
        const pcfg = POINTS_CONFIG.TEAM_MILESTONE;
        tx.pointsLedger.create({
            data: {
                id: nanoid(),
                userId,
                campaignId: input.campaignId,
                type: pcfg.type as unknown as PointType,
                value: pcfg.value,
                description: `Donated to campaign`,
                referenceId: donation.id,
                createdAt: new Date().toISOString(),
            },
        });
    });

    mockCache.del(`donations:stats:${input.campaignId}`);
    mockCache.invalidatePattern(`donations:user:${userId}`);
    mockCache.invalidatePattern(`points:summary:${userId}`);
    mockDb.emit("donations:changed");
    mockDb.emit("pointsLedger:changed");

    return donation;
}

// ─── Get Campaign Fundraising Stats ──────────────────────────────────────────

export async function getCampaignFundraisingStats(
    campaignId: string
): Promise<DonationStats> {
    const cacheKey = `donations:stats:${campaignId}`;
    const cached = mockCache.get<DonationStats>(cacheKey);
    if (cached) return cached;

    const allDonations = mockDb.donations._data.filter(
        (d) => d.campaignId === campaignId && d.status === "COMPLETED"
    );

    const totalRaised = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = new Set(allDonations.map((d) => d.userId)).size;

    // Participation count for conversion rate
    const participantCount = mockDb.participations._data.filter(
        (p) => p.campaignId === campaignId
    ).length;
    const conversionRate =
        participantCount > 0 ? donorCount / participantCount : 0;

    // Top donors per user
    const donorTotals = new Map<string, number>();
    for (const d of allDonations) {
        donorTotals.set(d.userId, (donorTotals.get(d.userId) ?? 0) + d.amount);
    }

    const topDonorsRaw = [...donorTotals.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const topDonors = topDonorsRaw.map(([uid, total]) => {
        const user = mockDb.users._data.find((u) => u.id === uid);
        return {
            userId: uid,
            firstName: user?.firstName ?? "Unknown",
            lastName: user?.lastName ?? "",
            total,
        };
    });

    const stats: DonationStats = {
        campaignId,
        totalRaised,
        donorCount,
        conversionRate,
        topDonors,
    };

    mockCache.set(cacheKey, stats, CACHE_TTL_DONATIONS);
    return stats;
}

// ─── Get User Donations ───────────────────────────────────────────────────────

export async function getUserDonations(
    userId: string,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
): Promise<{ data: Donation[]; total: number }> {
    const cacheKey = `donations:user:${userId}:${page}:${pageSize}`;
    const cached = mockCache.get<{ data: Donation[]; total: number }>(cacheKey);
    if (cached) return cached;

    const all = mockDb.donations._data
        .filter((d) => d.userId === userId)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    const total = all.length;
    const data = all.slice((page - 1) * pageSize, page * pageSize);

    const result = { data, total };
    mockCache.set(cacheKey, result, CACHE_TTL_DONATIONS);
    return result;
}
