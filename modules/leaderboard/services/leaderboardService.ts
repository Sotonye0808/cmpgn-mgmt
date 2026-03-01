import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { CACHE_TTL_LEADERBOARD } from "@/lib/constants";
import { getPointsSummary } from "@/modules/points/services/pointsService";

// ─── Compute ranked entries for a campaign or global ─────────────────────────
export async function computeRankings(campaignId?: string): Promise<LeaderboardEntry[]> {
    // Fetch all users who participated in the campaign (or all users for global)
    let userIds: string[];
    if (campaignId) {
        const participants = await mockDb.participations.findMany({ where: { campaignId } });
        userIds = [...new Set(participants.map((p) => p.userId))];
    } else {
        const users = await mockDb.users.findMany({ where: { isActive: true } });
        userIds = users.map((u) => u.id);
    }

    const entries: LeaderboardEntry[] = [];

    for (const userId of userIds) {
        const user = await mockDb.users.findUnique({ where: { id: userId } });
        if (!user) continue;

        const summary = await getPointsSummary(userId, campaignId);

        entries.push({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            rank: 0, // assigned after sort
            score: summary.total,
            impact: summary.impact,
            consistency: summary.consistency,
            leadership: summary.leadership,
            reliability: summary.reliability,
            campaignId,
        });
    }

    // Sort descending by score, assign ranks
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => {
        e.rank = i + 1;
    });

    return entries;
}

// ─── Team Leaderboard ─────────────────────────────────────────────────────────
export async function getTeamLeaderboard(
    campaignId?: string,
    page = 1,
    pageSize = 20,
): Promise<{ data: TeamLeaderboardEntry[]; total: number }> {
    const cacheKey = campaignId
        ? `leaderboard:team:${campaignId}`
        : "leaderboard:team:global";

    const cached = mockCache.get<TeamLeaderboardEntry[]>(cacheKey);
    if (cached) {
        const start = (page - 1) * pageSize;
        return { data: cached.slice(start, start + pageSize), total: cached.length };
    }

    const teams = mockDb.teams.findMany();
    const entries: TeamLeaderboardEntry[] = [];

    for (const team of teams) {
        let totalScore = 0;
        for (const memberId of team.memberIds) {
            const summary = await getPointsSummary(memberId, campaignId);
            totalScore += summary.total;
        }

        const group = mockDb.groups.findUnique({ where: { id: team.groupId } });
        entries.push({
            teamId: team.id,
            teamName: team.name,
            groupName: group?.name ?? "Unknown",
            memberCount: team.memberIds.length,
            score: totalScore,
            rank: 0,
        });
    }

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => { e.rank = i + 1; });

    mockCache.set(cacheKey, entries, CACHE_TTL_LEADERBOARD);

    const total = entries.length;
    const start = (page - 1) * pageSize;
    return { data: entries.slice(start, start + pageSize), total };
}

// ─── Group Leaderboard ────────────────────────────────────────────────────────
export async function getGroupLeaderboard(
    campaignId?: string,
    page = 1,
    pageSize = 20,
): Promise<{ data: GroupLeaderboardEntry[]; total: number }> {
    const cacheKey = campaignId
        ? `leaderboard:group:${campaignId}`
        : "leaderboard:group:global";

    const cached = mockCache.get<GroupLeaderboardEntry[]>(cacheKey);
    if (cached) {
        const start = (page - 1) * pageSize;
        return { data: cached.slice(start, start + pageSize), total: cached.length };
    }

    const groups = mockDb.groups.findMany();
    const entries: GroupLeaderboardEntry[] = [];

    for (const group of groups) {
        const groupTeams = mockDb.teams.findMany().filter(
            (t) => group.teamIds.includes(t.id)
        );
        let totalScore = 0;
        let totalMembers = 0;

        for (const team of groupTeams) {
            totalMembers += team.memberIds.length;
            for (const memberId of team.memberIds) {
                const summary = await getPointsSummary(memberId, campaignId);
                totalScore += summary.total;
            }
        }

        entries.push({
            groupId: group.id,
            groupName: group.name,
            teamCount: groupTeams.length,
            memberCount: totalMembers,
            score: totalScore,
            rank: 0,
        });
    }

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => { e.rank = i + 1; });

    mockCache.set(cacheKey, entries, CACHE_TTL_LEADERBOARD);

    const total = entries.length;
    const start = (page - 1) * pageSize;
    return { data: entries.slice(start, start + pageSize), total };
}

// ─── Get leaderboard (cached snapshot fallback to computed) ───────────────────
export async function getLeaderboard(
    filter: LeaderboardFilter,
    campaignId?: string,
    page = 1,
    pageSize = 20,
): Promise<{ data: LeaderboardEntry[]; total: number }> {
    const cacheKey = campaignId
        ? `leaderboard:${filter}:${campaignId}`
        : `leaderboard:${filter}:global`;

    const cached = mockCache.get<LeaderboardEntry[]>(cacheKey);
    let entries = cached;

    if (!entries) {
        entries = await computeRankings(filter === "global" ? undefined : campaignId);
        mockCache.set(cacheKey, entries, CACHE_TTL_LEADERBOARD);
    }

    const total = entries.length;
    const start = (page - 1) * pageSize;
    return { data: entries.slice(start, start + pageSize), total };
}

// ─── Get a single user's rank across a campaign ────────────────────────────────
export async function getUserRank(userId: string, campaignId?: string): Promise<UserRankInfo> {
    const entries = await computeRankings(campaignId);
    const entry = entries.find((e) => e.userId === userId);

    if (!entry) {
        return { position: entries.length + 1, score: 0, percentile: 0, campaignId };
    }

    const percentile = entries.length > 1
        ? Math.round(((entries.length - entry.rank) / (entries.length - 1)) * 100)
        : 100;

    return {
        position: entry.rank,
        score: entry.score,
        percentile,
        campaignId,
    };
}

// ─── Refresh and store a snapshot ────────────────────────────────────────────
export async function refreshSnapshot(campaignId?: string): Promise<void> {
    const entries = await computeRankings(campaignId);
    const now = new Date().toISOString();
    const period = now.slice(0, 10); // YYYY-MM-DD

    await mockDb.transaction(async (tx) => {
        for (const e of entries) {
            const snapshot: LeaderboardSnapshot = {
                id: crypto.randomUUID(),
                userId: e.userId,
                campaignId,
                period,
                rank: e.rank,
                score: e.score,
                createdAt: now,
            };
            await tx.leaderboardSnapshots.create({ data: snapshot });
        }
    });

    // Invalidate cache so next read re-queries
    mockCache.invalidatePattern(`leaderboard:`);
    mockDb.emit("leaderboardSnapshots:changed");
}
