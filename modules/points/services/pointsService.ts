import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { POINTS_CONFIG, CACHE_TTL_POINTS_SUMMARY } from "@/lib/constants";
import { RANK_LEVELS } from "@/config/ranks";

// ─── Award points for an action ───────────────────────────────────────────────
export async function award(
    userId: string,
    action: PointsAction,
    campaignId?: string,
    referenceId?: string,
): Promise<PointsLedgerEntry> {
    const config = POINTS_CONFIG[action];

    const entry = await prisma.$transaction(async (tx) => {
        const newEntry = await tx.pointsLedgerEntry.create({
            data: {
                userId,
                campaignId,
                type: config.type as never,
                value: config.value,
                description: action.replace(/_/g, " ").toLowerCase(),
                referenceId,
            },
        });
        await redis.del(`points:summary:${userId}`);
        if (campaignId) await redis.del(`points:summary:${userId}:${campaignId}`);
        return newEntry;
    });

    return {
        ...entry,
        type: entry.type as unknown as PointType,
        createdAt: entry.createdAt.toISOString(),
    } as unknown as PointsLedgerEntry;
}

// ─── Get points summary ───────────────────────────────────────────────────────
export async function getPointsSummary(
    userId: string,
    campaignId?: string,
): Promise<PointsSummary> {
    const cacheKey = campaignId
        ? `points:summary:${userId}:${campaignId}`
        : `points:summary:${userId}`;
    const cached = await redis.get<PointsSummary>(cacheKey);
    if (cached) return cached;

    const entries = await prisma.pointsLedgerEntry.findMany({
        where: campaignId ? { userId, campaignId } : { userId },
    });

    const summary: PointsSummary = {
        userId,
        campaignId,
        impact: 0,
        consistency: 0,
        leadership: 0,
        reliability: 0,
        total: 0,
    };

    for (const entry of entries) {
        const typeKey = entry.type.toString().toLowerCase() as keyof Omit<PointsSummary, "userId" | "campaignId" | "total">;
        if (typeKey in summary) {
            (summary as unknown as Record<string, number>)[typeKey] += entry.value;
        }
        summary.total += entry.value;
    }

    await redis.set(cacheKey, summary, CACHE_TTL_POINTS_SUMMARY);
    return summary;
}

// ─── Get current rank ─────────────────────────────────────────────────────────
export async function getRank(userId: string): Promise<RankLevel> {
    const summary = await getPointsSummary(userId);
    const total = summary.total;

    const sorted = [...RANK_LEVELS].sort((a, b) => b.minScore - a.minScore);
    return sorted.find((r) => total >= r.minScore) ?? RANK_LEVELS[0];
}

// ─── Get rank progress ────────────────────────────────────────────────────────
export async function getRankProgress(userId: string): Promise<RankProgress> {
    const summary = await getPointsSummary(userId);
    const total = summary.total;

    const sorted = [...RANK_LEVELS].sort((a, b) => a.minScore - b.minScore);
    const currentRank = [...sorted].reverse().find((r) => total >= r.minScore) ?? sorted[0];
    const currentIndex = sorted.findIndex((r) => r.level === currentRank.level);
    const nextRank = sorted[currentIndex + 1] ?? null;

    const base = currentRank.minScore;
    const cap = nextRank?.minScore ?? total;
    const progress = cap > base ? ((total - base) / (cap - base)) * 100 : 100;

    return {
        currentRank,
        nextRank,
        totalScore: total,
        pointsToNext: nextRank ? nextRank.minScore - total : null,
        progressPercent: Math.min(Math.round(progress), 100),
    };
}

// ─── Get paginated ledger ─────────────────────────────────────────────────────
export async function getLedger(
    userId: string,
    page = 1,
    pageSize = 20,
): Promise<{ data: PointsLedgerEntry[]; total: number }> {
    const [entries, total] = await Promise.all([
        prisma.pointsLedgerEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.pointsLedgerEntry.count({ where: { userId } }),
    ]);

    const data = entries.map((e) => ({
        ...e,
        type: e.type as unknown as PointType,
        createdAt: e.createdAt.toISOString(),
    })) as unknown as PointsLedgerEntry[];

    return { data, total };
}
