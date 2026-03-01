import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import {
    CACHE_TTL_DONATIONS,
    DEFAULT_PAGE_SIZE,
    POINTS_CONFIG,
} from "@/lib/constants";
import { nanoid } from "nanoid";
import { getBankAccountById } from "@/config/bankAccounts";

// ─── Record Donation ──────────────────────────────────────────────────────────

export async function recordDonation(
    userId: string,
    input: CreateDonationInputExtended
): Promise<Donation> {
    const campaign = mockDb.campaigns.findUnique({ where: { id: input.campaignId } });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== ("ACTIVE" as unknown as CampaignStatus))
        throw new Error("Campaign is not active");
    if (input.amount <= 0) throw new Error("Donation amount must be positive");

    // Validate bank account if provided
    if (input.bankAccountId) {
        const bank = getBankAccountById(input.bankAccountId);
        if (!bank) throw new Error("Invalid bank account");
        if (bank.currency !== (input.currency ?? "NGN"))
            throw new Error("Bank account currency does not match donation currency");
    }

    // Determine initial status based on whether proof is provided
    const hasProof = !!input.proofScreenshotUrl;
    const initialStatus = hasProof
        ? ("RECEIVED" as unknown as DonationStatus) // proof uploaded → awaiting verification
        : ("PENDING" as unknown as DonationStatus); // no proof yet

    let donation!: Donation;

    await mockDb.transaction(async (tx) => {
        donation = tx.donations.create({
            data: {
                id: nanoid(),
                userId,
                campaignId: input.campaignId,
                amount: input.amount,
                currency: input.currency ?? "NGN",
                status: initialStatus,
                reference: `DON-${nanoid(8).toUpperCase()}`,
                bankAccountId: input.bankAccountId,
                proofScreenshotUrl: input.proofScreenshotUrl,
                notes: input.notes,
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

// ─── Upload Proof of Payment ─────────────────────────────────────────────────

export async function uploadDonationProof(
    donationId: string,
    userId: string,
    proofScreenshotUrl: string
): Promise<Donation> {
    const donation = mockDb.donations.findUnique({ where: { id: donationId } });
    if (!donation) throw new Error("Donation not found");
    if (donation.userId !== userId)
        throw new Error("You can only upload proof for your own donations");
    if (donation.status !== ("PENDING" as unknown as DonationStatus))
        throw new Error("Proof can only be uploaded for PENDING donations");

    const updated = mockDb.donations.update({
        where: { id: donationId },
        data: {
            proofScreenshotUrl,
            status: "RECEIVED" as unknown as DonationStatus,
            updatedAt: new Date().toISOString(),
        },
    });
    if (!updated) throw new Error("Failed to update donation");
    mockCache.invalidatePattern(`donations:user:${userId}`);
    mockDb.emit("donations:changed");
    return updated;
}

// ─── Verify / Reject Donation (Admin) ────────────────────────────────────────

export async function verifyDonation(
    donationId: string,
    adminId: string,
    action: "VERIFIED" | "REJECTED",
    notes?: string
): Promise<Donation> {
    const donation = mockDb.donations.findUnique({ where: { id: donationId } });
    if (!donation) throw new Error("Donation not found");
    if (
        donation.status !== ("RECEIVED" as unknown as DonationStatus) &&
        donation.status !== ("PENDING" as unknown as DonationStatus)
    )
        throw new Error(
            `Cannot ${action.toLowerCase()} a donation with status ${donation.status}`
        );

    const updated = mockDb.donations.update({
        where: { id: donationId },
        data: {
            status: action as unknown as DonationStatus,
            verifiedById: adminId,
            verifiedAt: new Date().toISOString(),
            notes: notes ?? donation.notes,
            updatedAt: new Date().toISOString(),
        },
    });
    if (!updated) throw new Error("Failed to update donation");

    mockCache.del(`donations:stats:${donation.campaignId}`);
    mockCache.invalidatePattern(`donations:user:${donation.userId}`);
    mockDb.emit("donations:changed");

    return updated;
}

// ─── Get Campaign Fundraising Stats ──────────────────────────────────────────

export async function getCampaignFundraisingStats(
    campaignId: string
): Promise<DonationStats> {
    const cacheKey = `donations:stats:${campaignId}`;
    const cached = mockCache.get<DonationStats>(cacheKey);
    if (cached) return cached;

    const allDonations = mockDb.donations._data.filter(
        (d) =>
            d.campaignId === campaignId &&
            (d.status === "COMPLETED" || d.status === "VERIFIED")
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

// ─── Get Donation By ID ───────────────────────────────────────────────────────

export async function getDonationById(id: string): Promise<Donation | null> {
    return mockDb.donations.findUnique({ where: { id } }) ?? null;
}

// ─── List All Donations (Admin) ──────────────────────────────────────────────

export async function listDonations(
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    filters?: {
        status?: string;
        campaignId?: string;
        search?: string;
    }
): Promise<{ data: (Donation & { userName?: string; campaignTitle?: string })[]; total: number }> {
    let all = [...mockDb.donations._data];

    if (filters?.status) {
        all = all.filter((d) => d.status === filters.status);
    }
    if (filters?.campaignId) {
        all = all.filter((d) => d.campaignId === filters.campaignId);
    }
    if (filters?.search) {
        const term = filters.search.toLowerCase();
        all = all.filter((d) => {
            const user = mockDb.users._data.find((u) => u.id === d.userId);
            return (
                d.reference.toLowerCase().includes(term) ||
                (user &&
                    `${user.firstName} ${user.lastName}`
                        .toLowerCase()
                        .includes(term))
            );
        });
    }

    all.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = all.length;
    const page_data = all.slice((page - 1) * pageSize, page * pageSize);

    // Enrich with user and campaign names
    const enriched = page_data.map((d) => {
        const user = mockDb.users._data.find((u) => u.id === d.userId);
        const campaign = mockDb.campaigns._data.find(
            (c) => c.id === d.campaignId
        );
        return {
            ...d,
            userName: user
                ? `${user.firstName} ${user.lastName}`
                : "Unknown User",
            campaignTitle: campaign?.title ?? "Unknown Campaign",
        };
    });

    return { data: enriched, total };
}

// ─── Donation Analytics ──────────────────────────────────────────────────────

export async function getDonationAnalytics(): Promise<DonationAnalytics> {
    const cacheKey = "donations:analytics";
    const cached = mockCache.get<DonationAnalytics>(cacheKey);
    if (cached) return cached;

    const all = mockDb.donations._data;

    const totalRaised = all
        .filter((d) => d.status === "COMPLETED" || d.status === "VERIFIED")
        .reduce((sum, d) => sum + d.amount, 0);

    const byStatus: Record<string, { count: number; amount: number }> = {};
    for (const d of all) {
        const s = String(d.status);
        if (!byStatus[s]) byStatus[s] = { count: 0, amount: 0 };
        byStatus[s].count++;
        byStatus[s].amount += d.amount;
    }

    const byCurrency: Record<string, { count: number; amount: number }> = {};
    for (const d of all) {
        if (!byCurrency[d.currency]) byCurrency[d.currency] = { count: 0, amount: 0 };
        byCurrency[d.currency].count++;
        byCurrency[d.currency].amount += d.amount;
    }

    // Timeline — group by date
    const dateMap = new Map<string, { amount: number; count: number }>();
    for (const d of all) {
        const date = d.createdAt.split("T")[0];
        const existing = dateMap.get(date) ?? { amount: 0, count: 0 };
        existing.amount += d.amount;
        existing.count++;
        dateMap.set(date, existing);
    }
    const timeline = [...dateMap.entries()]
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Top donors
    const donorTotals = new Map<string, number>();
    for (const d of all.filter(
        (d) => d.status === "COMPLETED" || d.status === "VERIFIED"
    )) {
        donorTotals.set(d.userId, (donorTotals.get(d.userId) ?? 0) + d.amount);
    }
    const topDonors = [...donorTotals.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([uid, total]) => {
            const user = mockDb.users._data.find((u) => u.id === uid);
            return {
                userId: uid,
                firstName: user?.firstName ?? "Unknown",
                lastName: user?.lastName ?? "",
                total,
            };
        });

    const analytics: DonationAnalytics = {
        totalRaised,
        totalCount: all.length,
        byStatus,
        timeline,
        topDonors,
        averageAmount: all.length > 0 ? totalRaised / all.length : 0,
        byCurrency,
    };

    mockCache.set(cacheKey, analytics, CACHE_TTL_DONATIONS);
    return analytics;
}
