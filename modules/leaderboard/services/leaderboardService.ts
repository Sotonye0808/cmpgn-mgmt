import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { CACHE_TTL_LEADERBOARD } from "@/lib/constants";
import { RANK_LEVELS } from "@/config/ranks";

// ─── Compute Rankings ─────────────────────────────────────────────────────────

async function computeRankings(
    campaignId?: string
): Promise<LeaderboardEntry[]> {
    const where: Record<string, unknown> = {};
    if (campaignId) where.campaignId = campaignId;

    const entries = await prisma.pointsLedgerEntry.findMany({
        where: where as never,
    });

    // Aggregate by userId + type
    const userScores = new Map<
        string,
        { impact: number; consistency: number; leadership: number; reliability: number }
    >();

    for (const e of entries) {
        const uid = e.userId;
        const current = userScores.get(uid) ?? {
            impact: 0,
            consistency: 0,
            leadership: 0,
            reliability: 0,
        };
        const type = (e.type as string).toLowerCase() as
            | "impact"
            | "consistency"
            | "leadership"
            | "reliability";
        current[type] += e.value;
        userScores.set(uid, current);
    }

    // Fetch user details for all userIds
    const userIds = Array.from(userScores.keys());
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, profilePicture: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build entries sorted by total score desc
    const rankings: LeaderboardEntry[] = userIds
        .map((uid) => {
            const scores = userScores.get(uid)!;
            const total =
                scores.impact +
                scores.consistency +
                scores.leadership +
                scores.reliability;
            const user = userMap.get(uid);
            return {
                userId: uid,
                firstName: user?.firstName ?? "Unknown",
                lastName: user?.lastName ?? "",
                profilePicture: user?.profilePicture ?? undefined,
                rank: 0,
                score: total,
                impact: scores.impact,
                consistency: scores.consistency,
                leadership: scores.leadership,
                reliability: scores.reliability,
                campaignId,
            };
        })
        .sort((a, b) => b.score - a.score);

    // Assign ranks
    rankings.forEach((entry, idx) => {
        entry.rank = idx + 1;
    });

    return rankings;
}

// ─── Team Leaderboard ─────────────────────────────────────────────────────────

export async function getTeamLeaderboard(
    campaignId?: string
): Promise<TeamLeaderboardEntry[]> {
    const cacheKey = `leaderboard:team:${campaignId ?? "global"}`;
    const cached = await redis.get<TeamLeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const rankings = await computeRankings(campaignId);
    const rankMap = new Map(rankings.map((r) => [r.userId, r.score]));

    // Get all teams with their members and groups
    const teams = await prisma.team.findMany({
        include: {
            group: { select: { name: true } },
            members: { select: { id: true } },
        },
    });

    const entries: TeamLeaderboardEntry[] = teams
        .map((team) => {
            const memberIds = team.members.map((m) => m.id);
            const score = memberIds.reduce(
                (sum, mid) => sum + (rankMap.get(mid) ?? 0),
                0
            );
            return {
                teamId: team.id,
                teamName: team.name,
                groupName: team.group?.name ?? "Unassigned",
                memberCount: memberIds.length,
                score,
                rank: 0,
            };
        })
        .sort((a, b) => b.score - a.score);

    entries.forEach((e, i) => {
        e.rank = i + 1;
    });

    await redis.set(cacheKey, entries, CACHE_TTL_LEADERBOARD);
    return entries;
}

// ─── Group Leaderboard ────────────────────────────────────────────────────────

export async function getGroupLeaderboard(
    campaignId?: string
): Promise<GroupLeaderboardEntry[]> {
    const cacheKey = `leaderboard:group:${campaignId ?? "global"}`;
    const cached = await redis.get<GroupLeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const rankings = await computeRankings(campaignId);
    const rankMap = new Map(rankings.map((r) => [r.userId, r.score]));

    // Get all groups with their teams and team members
    const groups = await prisma.group.findMany({
        include: {
            teams: {
                include: { members: { select: { id: true } } },
            },
        },
    });

    const entries: GroupLeaderboardEntry[] = groups
        .map((group) => {
            const memberIds = group.teams.flatMap((t) =>
                t.members.map((m) => m.id)
            );
            const score = memberIds.reduce(
                (sum, mid) => sum + (rankMap.get(mid) ?? 0),
                0
            );
            return {
                groupId: group.id,
                groupName: group.name,
                teamCount: group.teams.length,
                memberCount: memberIds.length,
                score,
                rank: 0,
            };
        })
        .sort((a, b) => b.score - a.score);

    entries.forEach((e, i) => {
        e.rank = i + 1;
    });

    await redis.set(cacheKey, entries, CACHE_TTL_LEADERBOARD);
    return entries;
}

// ─── Get Leaderboard (unified) ────────────────────────────────────────────────

export async function getLeaderboard(
    filter: LeaderboardFilter = "individual",
    campaignId?: string
): Promise<LeaderboardEntry[] | TeamLeaderboardEntry[] | GroupLeaderboardEntry[]> {
    if (filter === "team") return getTeamLeaderboard(campaignId);
    if (filter === "group") return getGroupLeaderboard(campaignId);

    const cacheKey = `leaderboard:${filter}:${campaignId ?? "global"}`;
    const cached = await redis.get<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const rankings = await computeRankings(campaignId);
    await redis.set(cacheKey, rankings, CACHE_TTL_LEADERBOARD);
    return rankings;
}

// ─── Get User Rank ────────────────────────────────────────────────────────────

export async function getUserRank(
    userId: string,
    campaignId?: string
): Promise<UserRankInfo> {
    const rankings = await computeRankings(campaignId);
    const entry = rankings.find((r) => r.userId === userId);

    const position = entry?.rank ?? rankings.length + 1;
    const score = entry?.score ?? 0;
    const percentile =
        rankings.length > 0
            ? Math.round(((rankings.length - position + 1) / rankings.length) * 100)
            : 0;

    return { position, score, percentile, campaignId };
}

// ─── Rank Progress ────────────────────────────────────────────────────────────

export function getRankProgress(totalScore: number): RankProgress {
    let currentRank = RANK_LEVELS[0];
    let nextRank: RankLevel | null = RANK_LEVELS[1] ?? null;

    for (let i = RANK_LEVELS.length - 1; i >= 0; i--) {
        if (totalScore >= RANK_LEVELS[i].minScore) {
            currentRank = RANK_LEVELS[i];
            nextRank = RANK_LEVELS[i + 1] ?? null;
            break;
        }
    }

    const pointsToNext = nextRank
        ? nextRank.minScore - totalScore
        : null;

    const progressPercent = nextRank
        ? Math.min(
            100,
            Math.round(
                ((totalScore - currentRank.minScore) /
                    (nextRank.minScore - currentRank.minScore)) *
                100
            )
        )
        : 100;

    return { currentRank, nextRank, totalScore, pointsToNext, progressPercent };
}

// ─── Refresh Snapshot (cron) ──────────────────────────────────────────────────

export async function refreshSnapshot(
    campaignId?: string,
    period = "weekly"
): Promise<void> {
    const rankings = await computeRankings(campaignId);

    await prisma.$transaction(async (tx) => {
        // Delete old snapshots for this period+campaign
        await tx.leaderboardSnapshot.deleteMany({
            where: {
                period,
                campaignId: campaignId ?? undefined,
            },
        });

        // Insert new snapshots
        for (const entry of rankings) {
            await tx.leaderboardSnapshot.create({
                data: {
                    userId: entry.userId,
                    campaignId: entry.campaignId,
                    period,
                    rank: entry.rank,
                    score: entry.score,
                },
            });
        }
    });

    await redis.invalidatePattern("leaderboard:");
}
