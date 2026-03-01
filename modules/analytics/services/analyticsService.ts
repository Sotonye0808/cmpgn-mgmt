import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { CACHE_TTL_ANALYTICS } from "@/lib/constants";
import { getUserEngagement } from "@/modules/engagement/services/engagementService";
import { getReferralStats } from "@/modules/referral/services/referralService";
import { getPointsSummary, getRankProgress } from "@/modules/points/services/pointsService";
import { computeRankings } from "@/modules/leaderboard/services/leaderboardService";
import { getCampaignFundraisingStats } from "@/modules/donation/services/donationService";

// ─── User Analytics ───────────────────────────────────────────────────────────

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const cacheKey = `analytics:user:${userId}`;
    const cached = mockCache.get<UserAnalytics>(cacheKey);
    if (cached) return cached;

    const [engagement, points, rank, referrals] = await Promise.all([
        getUserEngagement(userId),
        getPointsSummary(userId),
        getRankProgress(userId),
        getReferralStats(userId),
    ]);

    // Donations summary
    const userDonations = mockDb.donations._data.filter(
        (d) => d.userId === userId && d.status === ("COMPLETED" as unknown as DonationStatus)
    );
    const donations = {
        total: userDonations.reduce((s, d) => s + d.amount, 0),
        count: userDonations.length,
    };

    // Simple streak calculation: count consecutive days with at least 1 event
    const events = mockDb.linkEvents._data
        .filter((e) => e.userId === userId)
        .map((e) => e.createdAt.slice(0, 10)) // YYYY-MM-DD
        .sort();

    const uniqueDays = [...new Set(events)];
    let daily = 0;
    let weekly = 0;

    if (uniqueDays.length > 0) {
        const today = new Date().toISOString().slice(0, 10);
        for (let i = uniqueDays.length - 1; i >= 0; i--) {
            const expected = new Date(
                new Date(today).getTime() - daily * 86400000
            )
                .toISOString()
                .slice(0, 10);
            if (uniqueDays[i] === expected) daily++;
            else break;
        }

        // Weekly: groups of 7-day buckets
        const weekBuckets = new Set(
            uniqueDays.map((d) =>
                Math.floor(new Date(d).getTime() / (7 * 86400000))
            )
        );
        const sortedWeeks = [...weekBuckets].sort().reverse();
        const currentWeek = Math.floor(Date.now() / (7 * 86400000));
        for (let i = 0; i < sortedWeeks.length; i++) {
            if (sortedWeeks[i] === currentWeek - i) weekly++;
            else break;
        }
    }

    const result: UserAnalytics = {
        engagement,
        points,
        rank,
        referrals,
        donations,
        streaks: { daily, weekly },
    };

    mockCache.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Campaign Analytics ───────────────────────────────────────────────────────

export async function getCampaignAnalytics(
    campaignId: string
): Promise<CampaignAnalytics> {
    const cacheKey = `analytics:campaign:${campaignId}`;
    const cached = mockCache.get<CampaignAnalytics>(cacheKey);
    if (cached) return cached;

    const participations = mockDb.participations._data.filter(
        (p) => p.campaignId === campaignId
    );

    // Daily participant growth
    const growthMap = new Map<string, number>();
    for (const p of participations) {
        const day = p.joinedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
        growthMap.set(day, (growthMap.get(day) ?? 0) + 1);
    }
    const growth = [...growthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

    const [topPerformers, fundraising] = await Promise.all([
        computeRankings(campaignId).then((r) => r.slice(0, 10)),
        getCampaignFundraisingStats(campaignId),
    ]);

    // Build engagement trend inline for campaign (all users)
    const campaignLinkIds = new Set(
        mockDb.smartLinks._data
            .filter((l) => l.campaignId === campaignId)
            .map((l) => l.id)
    );
    const campaignEvents = mockDb.linkEvents._data.filter(
        (e) => e.linkId && campaignLinkIds.has(e.linkId)
    );

    const now = new Date();
    const engagementTrend: EngagementTimelinePoint[] = [];
    for (let i = 29; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        const dateStr = day.toISOString().slice(0, 10);
        const dayEvents = campaignEvents.filter(
            (e) => e.createdAt.slice(0, 10) === dateStr
        );
        engagementTrend.push({
            date: dateStr,
            clicks: dayEvents.filter((e) => e.eventType === ("CLICK" as unknown as LinkEventType)).length,
            shares: dayEvents.filter((e) => e.eventType === ("SHARE" as unknown as LinkEventType)).length,
            conversions: dayEvents.filter((e) => e.eventType === ("CONVERSION" as unknown as LinkEventType)).length,
        });
    }

    const result: CampaignAnalytics = {
        participants: participations.length,
        growth,
        topPerformers,
        engagementTrend,
        fundraising,
    };

    mockCache.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Overview Analytics (Admin) ───────────────────────────────────────────────

export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
    const cacheKey = "analytics:overview";
    const cached = mockCache.get<OverviewAnalytics>(cacheKey);
    if (cached) return cached;

    const totalUsers = mockDb.users._data.length;
    const activeCampaigns = mockDb.campaigns._data.filter(
        (c) => c.status === ("ACTIVE" as unknown as CampaignStatus)
    ).length;

    const totalDonations = mockDb.donations._data
        .filter((d) => d.status === ("COMPLETED" as unknown as DonationStatus))
        .reduce((s, d) => s + d.amount, 0);

    const totalPoints = mockDb.pointsLedger._data.reduce(
        (s, p) => s + p.value,
        0
    );

    const campaigns = mockDb.campaigns._data
        .filter((c) => c.status === ("ACTIVE" as unknown as CampaignStatus))
        .map((c) => ({
            id: c.id,
            title: c.title,
            participants: mockDb.participations._data.filter(
                (p) => p.campaignId === c.id
            ).length,
        }))
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 5);

    const result: OverviewAnalytics = {
        totalUsers,
        activeCampaigns,
        totalDonations,
        totalPoints,
        topCampaigns: campaigns,
    };

    mockCache.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Team Analytics ──────────────────────────────────────────────────────────

export interface TeamAnalytics {
    teamId: string;
    teamName: string;
    memberCount: number;
    totalPoints: number;
    totalDonations: number;
    averagePointsPerMember: number;
    topMembers: { userId: string; firstName: string; lastName: string; score: number }[];
}

export async function getTeamAnalytics(teamId: string): Promise<TeamAnalytics | null> {
    const cacheKey = `analytics:team:${teamId}`;
    const cached = mockCache.get<TeamAnalytics>(cacheKey);
    if (cached) return cached;

    const team = mockDb.teams._data.find((t) => t.id === teamId);
    if (!team) return null;

    const memberIds = team.memberIds;

    // Points per member
    const memberPoints = memberIds.map((uid) => {
        const points = mockDb.pointsLedger._data
            .filter((p) => p.userId === uid)
            .reduce((s, p) => s + p.value, 0);
        const user = mockDb.users._data.find((u) => u.id === uid);
        return {
            userId: uid,
            firstName: user?.firstName ?? "Unknown",
            lastName: user?.lastName ?? "",
            score: points,
        };
    });

    const totalPoints = memberPoints.reduce((s, m) => s + m.score, 0);

    const totalDonations = mockDb.donations._data
        .filter(
            (d) =>
                memberIds.includes(d.userId) &&
                (d.status === "COMPLETED" || d.status === "VERIFIED")
        )
        .reduce((s, d) => s + d.amount, 0);

    const teamAnalytics: TeamAnalytics = {
        teamId,
        teamName: team.name,
        memberCount: memberIds.length,
        totalPoints,
        totalDonations,
        averagePointsPerMember:
            memberIds.length > 0 ? totalPoints / memberIds.length : 0,
        topMembers: memberPoints.sort((a, b) => b.score - a.score).slice(0, 5),
    };

    mockCache.set(cacheKey, teamAnalytics, CACHE_TTL_ANALYTICS);
    return teamAnalytics;
}

// ─── All Teams Summary (Admin) ───────────────────────────────────────────────

export async function getAllTeamsAnalytics(): Promise<TeamAnalytics[]> {
    const cacheKey = "analytics:teams:all";
    const cached = mockCache.get<TeamAnalytics[]>(cacheKey);
    if (cached) return cached;

    const teams = mockDb.teams._data;
    const results: TeamAnalytics[] = [];

    for (const team of teams) {
        const analytics = await getTeamAnalytics(team.id);
        if (analytics) results.push(analytics);
    }

    results.sort((a, b) => b.totalPoints - a.totalPoints);
    mockCache.set(cacheKey, results, CACHE_TTL_ANALYTICS);
    return results;
}
