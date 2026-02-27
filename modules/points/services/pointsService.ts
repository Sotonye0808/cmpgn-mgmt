import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
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

    const entry = await mockDb.transaction(async (tx) => {
        const newEntry: PointsLedgerEntry = {
            id: crypto.randomUUID(),
            userId,
            campaignId,
            type: config.type as PointType,
            value: config.value,
            description: action.replace(/_/g, " ").toLowerCase(),
            referenceId,
            createdAt: new Date().toISOString(),
        };
        await tx.pointsLedger.create({ data: newEntry });
        mockCache.del(`points:summary:${userId}`);
        if (campaignId) mockCache.del(`points:summary:${userId}:${campaignId}`);
        mockDb.emit("pointsLedger:changed");
        return newEntry;
    });

    return entry;
}

// ─── Get points summary ───────────────────────────────────────────────────────
export async function getPointsSummary(
    userId: string,
    campaignId?: string,
): Promise<PointsSummary> {
    const cacheKey = campaignId
        ? `points:summary:${userId}:${campaignId}`
        : `points:summary:${userId}`;
    const cached = mockCache.get<PointsSummary>(cacheKey);
    if (cached) return cached;

    const entries = await mockDb.pointsLedger.findMany({
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

    mockCache.set(cacheKey, summary, CACHE_TTL_POINTS_SUMMARY);
    return summary;
}

// ─── Get current rank ─────────────────────────────────────────────────────────
export async function getRank(userId: string): Promise<RankLevel> {
    const summary = await getPointsSummary(userId);
    const total = summary.total;

    // Find highest rank level the user has reached
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
    const all = await mockDb.pointsLedger.findMany({ where: { userId } });
    const sorted = all.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const start = (page - 1) * pageSize;
    return { data: sorted.slice(start, start + pageSize), total: sorted.length };
}
