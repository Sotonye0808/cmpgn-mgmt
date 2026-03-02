import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize, serializeArray } from "@/lib/utils/serialize";
import { CACHE_TTL_DONATIONS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { recordCampaignAudit } from "@/modules/campaign/services/campaignService";
import { nanoid } from "nanoid";
import type { PaginatedResponse } from "@/types/api";

// ─── Record Donation ──────────────────────────────────────────────────────────

export async function recordDonation(
    userId: string,
    input: CreateDonationInputExtended
): Promise<Donation> {
    const reference = `DON-${nanoid(8).toUpperCase()}`;

    const donation = await prisma.$transaction(async (tx) => {
        const d = await tx.donation.create({
            data: {
                userId,
                campaignId: input.campaignId,
                amount: input.amount,
                currency: input.currency ?? "NGN",
                status: "PENDING" as never,
                reference,
                bankAccountId: input.bankAccountId,
                proofScreenshotUrl: input.proofScreenshotUrl,
                notes: input.notes ?? input.message,
            },
        });

        // Award points for donating
        await tx.pointsLedgerEntry.create({
            data: {
                userId,
                campaignId: input.campaignId,
                type: "RELIABILITY" as never,
                value: 10,
                description: `Donation ${reference} submitted`,
                referenceId: d.id,
            },
        });

        return d;
    });

    await redis.invalidatePattern(`donations:`);
    await redis.del(`points:summary:${userId}`);

    await recordCampaignAudit(input.campaignId, userId, "USER", "DONATION_RECEIVED", {
        after: { amount: input.amount, currency: input.currency, reference },
        note: `Donation ${reference} of ${input.amount} ${input.currency}`,
    });

    return serialize<Donation>(donation);
}

// ─── Upload Proof ─────────────────────────────────────────────────────────────

export async function uploadDonationProof(
    donationId: string,
    screenshotUrl: string
): Promise<Donation> {
    const donation = await prisma.donation.update({
        where: { id: donationId },
        data: { proofScreenshotUrl: screenshotUrl },
    });
    await redis.invalidatePattern("donations:");
    return serialize<Donation>(donation);
}

// ─── Verify Donation (Admin) ──────────────────────────────────────────────────

export async function verifyDonation(
    donationId: string,
    status: DonationStatus,
    verifiedById: string,
    notes?: string
): Promise<Donation> {
    const donation = await prisma.$transaction(async (tx) => {
        const d = await tx.donation.update({
            where: { id: donationId },
            data: {
                status: status as never,
                verifiedById,
                verifiedAt: new Date(),
                notes,
            },
        });

        // If verified/received, update campaign goal
        if (status === "VERIFIED" || status === "RECEIVED") {
            const amountNum = typeof d.amount === "object"
                ? (d.amount as unknown as { toNumber(): number }).toNumber()
                : Number(d.amount);

            await tx.campaign.update({
                where: { id: d.campaignId },
                data: { goalCurrent: { increment: amountNum } },
            });
        }

        return d;
    });

    await redis.invalidatePattern("donations:");
    return serialize<Donation>(donation);
}

// ─── Campaign Fundraising Stats ───────────────────────────────────────────────

export async function getCampaignFundraisingStats(
    campaignId: string
): Promise<DonationStats> {
    const cacheKey = `donations:stats:${campaignId}`;
    const cached = await redis.get<DonationStats>(cacheKey);
    if (cached) return cached;

    const donations = await prisma.donation.findMany({
        where: { campaignId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    const verified = donations.filter(
        (d) => d.status === "VERIFIED" || d.status === "RECEIVED"
    );

    const totalRaised = verified.reduce((s, d) => {
        const amount = typeof d.amount === "object"
            ? (d.amount as unknown as { toNumber(): number }).toNumber()
            : Number(d.amount);
        return s + amount;
    }, 0);

    const donorIds = new Set(verified.map((d) => d.userId));

    // Top donors
    const donorTotals = new Map<string, { userId: string; firstName: string; lastName: string; total: number }>();
    for (const d of verified) {
        const amount = typeof d.amount === "object"
            ? (d.amount as unknown as { toNumber(): number }).toNumber()
            : Number(d.amount);
        const existing = donorTotals.get(d.userId);
        if (existing) {
            existing.total += amount;
        } else {
            donorTotals.set(d.userId, {
                userId: d.userId,
                firstName: d.user.firstName,
                lastName: d.user.lastName,
                total: amount,
            });
        }
    }

    const topDonors = Array.from(donorTotals.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const participantCount = await prisma.campaignParticipation.count({ where: { campaignId } });
    const conversionRate = participantCount > 0
        ? Number(((donorIds.size / participantCount) * 100).toFixed(1))
        : 0;

    const stats: DonationStats = {
        campaignId,
        totalRaised,
        donorCount: donorIds.size,
        conversionRate,
        topDonors,
    };

    await redis.set(cacheKey, stats, CACHE_TTL_DONATIONS);
    return stats;
}

// ─── Get User Donations ───────────────────────────────────────────────────────

export async function getUserDonations(userId: string): Promise<Donation[]> {
    const donations = await prisma.donation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    return serializeArray<Donation>(donations);
}

// ─── Get Donation By ID ───────────────────────────────────────────────────────

export async function getDonationById(id: string): Promise<Donation | null> {
    const donation = await prisma.donation.findUnique({ where: { id } });
    return donation ? serialize<Donation>(donation) : null;
}

// ─── List Donations (Admin, enriched) ─────────────────────────────────────────

export async function listDonations(
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: DEFAULT_PAGE_SIZE },
    filters?: { campaignId?: string; status?: DonationStatus; userId?: string }
): Promise<PaginatedResponse<Donation & { userName?: string; campaignTitle?: string }>> {
    const where: Record<string, unknown> = {};
    if (filters?.campaignId) where.campaignId = filters.campaignId;
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [raw, total] = await Promise.all([
        prisma.donation.findMany({
            where: where as never,
            orderBy: { createdAt: "desc" },
            skip: (pagination.page - 1) * pagination.pageSize,
            take: pagination.pageSize,
            include: {
                user: { select: { firstName: true, lastName: true } },
                campaign: { select: { title: true } },
            },
        }),
        prisma.donation.count({ where: where as never }),
    ]);

    const data = raw.map((d) => {
        const { user, campaign, ...rest } = d;
        return {
            ...serialize<Donation>(rest),
            userName: user ? `${user.firstName} ${user.lastName}` : undefined,
            campaignTitle: campaign?.title,
        };
    });

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

// ─── Donation Analytics ───────────────────────────────────────────────────────

export async function getDonationAnalytics(
    filters?: { campaignId?: string }
): Promise<DonationAnalytics> {
    const where: Record<string, unknown> = {};
    if (filters?.campaignId) where.campaignId = filters.campaignId;

    const donations = await prisma.donation.findMany({
        where: where as never,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
    });

    const toNum = (val: unknown): number => {
        if (val !== null && typeof val === "object" && typeof (val as { toNumber(): number }).toNumber === "function") {
            return (val as { toNumber(): number }).toNumber();
        }
        return Number(val);
    };

    // Total raised (all statuses except FAILED/REFUNDED/REJECTED)
    const countable = donations.filter(
        (d) => !["FAILED", "REFUNDED", "REJECTED"].includes(d.status as string)
    );
    const totalRaised = countable.reduce((s, d) => s + toNum(d.amount), 0);
    const totalCount = countable.length;

    // By status
    const byStatus: Record<string, { count: number; amount: number }> = {};
    for (const d of donations) {
        const st = d.status as string;
        if (!byStatus[st]) byStatus[st] = { count: 0, amount: 0 };
        byStatus[st].count++;
        byStatus[st].amount += toNum(d.amount);
    }

    // Timeline (day-by-day)
    const timelineMap = new Map<string, { amount: number; count: number }>();
    for (const d of countable) {
        const date = new Date(d.createdAt).toISOString().slice(0, 10);
        const entry = timelineMap.get(date) ?? { amount: 0, count: 0 };
        entry.amount += toNum(d.amount);
        entry.count++;
        timelineMap.set(date, entry);
    }
    const timeline = Array.from(timelineMap.entries())
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Top donors
    const donorMap = new Map<string, { userId: string; firstName: string; lastName: string; total: number }>();
    for (const d of countable) {
        const key = d.userId;
        const existing = donorMap.get(key);
        if (existing) {
            existing.total += toNum(d.amount);
        } else {
            donorMap.set(key, {
                userId: d.userId,
                firstName: d.user.firstName,
                lastName: d.user.lastName,
                total: toNum(d.amount),
            });
        }
    }
    const topDonors = Array.from(donorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const averageAmount = totalCount > 0 ? totalRaised / totalCount : 0;

    // By currency
    const byCurrency: Record<string, { count: number; amount: number }> = {};
    for (const d of countable) {
        const c = d.currency;
        if (!byCurrency[c]) byCurrency[c] = { count: 0, amount: 0 };
        byCurrency[c].count++;
        byCurrency[c].amount += toNum(d.amount);
    }

    return {
        totalRaised,
        totalCount,
        byStatus,
        timeline,
        topDonors,
        averageAmount,
        byCurrency,
    };
}
