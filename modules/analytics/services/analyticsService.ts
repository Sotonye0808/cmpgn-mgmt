import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { CACHE_TTL_ANALYTICS } from "@/lib/constants";
import { getRankProgress } from "@/modules/leaderboard/services/leaderboardService";

// ─── User Analytics ───────────────────────────────────────────────────────────

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const cacheKey = `analytics:user:${userId}`;
    const cached = await redis.get<UserAnalytics>(cacheKey);
    if (cached) return cached;

    // Gather all data in parallel
    const [links, events, referrals, pointEntries, donations] = await Promise.all([
        prisma.smartLink.findMany({ where: { userId } }),
        prisma.linkEvent.findMany({
            where: { smartLink: { userId } },
        }),
        prisma.referral.findMany({ where: { inviterId: userId } }),
        prisma.pointsLedgerEntry.findMany({ where: { userId } }),
        prisma.donation.findMany({ where: { userId } }),
    ]);

    // Engagement stats
    const clicks = events.filter((e) => e.eventType === "CLICK").length;
    const shares = events.filter((e) => e.eventType === "SHARE").length;
    const views = events.filter((e) => e.eventType === "VIEW").length;
    const conversions = events.filter((e) => e.eventType === "CONVERSION").length;
    const uniqueVisitors = new Set(events.map((e) => e.ipAddress).filter(Boolean)).size;

    const engagement: EngagementStats = {
        userId,
        shares,
        clicks,
        views,
        conversions,
        referrals: referrals.length,
        uniqueVisitors,
    };

    // Points summary
    const impact = pointEntries
        .filter((p) => p.type === "IMPACT")
        .reduce((s, p) => s + p.value, 0);
    const consistency = pointEntries
        .filter((p) => p.type === "CONSISTENCY")
        .reduce((s, p) => s + p.value, 0);
    const leadership = pointEntries
        .filter((p) => p.type === "LEADERSHIP")
        .reduce((s, p) => s + p.value, 0);
    const reliability = pointEntries
        .filter((p) => p.type === "RELIABILITY")
        .reduce((s, p) => s + p.value, 0);
    const total = impact + consistency + leadership + reliability;

    const points: PointsSummary = {
        userId,
        impact,
        consistency,
        leadership,
        reliability,
        total,
    };

    // Rank progress
    const rank = getRankProgress(total);

    // Referral stats
    const referralStats: ReferralStats = {
        userId,
        totalReferrals: referrals.length,
        activeReferrals: referrals.length,
        conversionRate: links.length > 0
            ? Number(((conversions / Math.max(clicks, 1)) * 100).toFixed(1))
            : 0,
        directInvites: referrals.length,
    };

    // Donation summary
    const toNum = (val: unknown): number => {
        if (val !== null && typeof val === "object" && typeof (val as { toNumber(): number }).toNumber === "function") {
            return (val as { toNumber(): number }).toNumber();
        }
        return Number(val);
    };
    const donationTotal = donations.reduce((s, d) => s + toNum(d.amount), 0);

    // Streaks (simplified: count consecutive days with activity)
    const eventDates = events
        .map((e) => new Date(e.createdAt).toISOString().slice(0, 10))
        .sort();
    const uniqueDates = [...new Set(eventDates)];
    let dailyStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
        const expected = new Date(Date.now() - (uniqueDates.length - 1 - i) * 86400000)
            .toISOString()
            .slice(0, 10);
        if (uniqueDates[i] === expected || uniqueDates[i] === today) {
            dailyStreak++;
        } else {
            break;
        }
    }

    const result: UserAnalytics = {
        engagement,
        points,
        rank,
        referrals: referralStats,
        donations: { total: donationTotal, count: donations.length },
        streaks: { daily: dailyStreak, weekly: Math.floor(dailyStreak / 7) },
    };

    await redis.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Campaign Analytics ───────────────────────────────────────────────────────

export async function getCampaignAnalytics(
    campaignId: string
): Promise<CampaignAnalytics> {
    const cacheKey = `analytics:campaign:${campaignId}`;
    const cached = await redis.get<CampaignAnalytics>(cacheKey);
    if (cached) return cached;

    const [participations, events, pointEntries, donations] = await Promise.all([
        prisma.campaignParticipation.findMany({
            where: { campaignId },
            orderBy: { joinedAt: "asc" },
        }),
        prisma.linkEvent.findMany({
            where: { smartLink: { campaignId } },
            orderBy: { createdAt: "asc" },
        }),
        prisma.pointsLedgerEntry.findMany({
            where: { campaignId },
        }),
        prisma.donation.findMany({
            where: { campaignId },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
        }),
    ]);

    // Participation growth
    const growthMap = new Map<string, number>();
    for (const p of participations) {
        const date = new Date(p.joinedAt).toISOString().slice(0, 10);
        growthMap.set(date, (growthMap.get(date) ?? 0) + 1);
    }
    const growth = Array.from(growthMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Top performers (by points in this campaign)
    const userScores = new Map<string, number>();
    for (const p of pointEntries) {
        userScores.set(p.userId, (userScores.get(p.userId) ?? 0) + p.value);
    }
    const topUserIds = Array.from(userScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([uid]) => uid);
    const topUsers = await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: { id: true, firstName: true, lastName: true, profilePicture: true },
    });
    const topUserMap = new Map(topUsers.map((u) => [u.id, u]));

    const topPerformers: LeaderboardEntry[] = topUserIds.map((uid, idx) => {
        const user = topUserMap.get(uid);
        return {
            userId: uid,
            firstName: user?.firstName ?? "Unknown",
            lastName: user?.lastName ?? "",
            profilePicture: user?.profilePicture ?? undefined,
            rank: idx + 1,
            score: userScores.get(uid) ?? 0,
            impact: 0,
            consistency: 0,
            leadership: 0,
            reliability: 0,
            campaignId,
        };
    });

    // Engagement trend (daily)
    const trendMap = new Map<string, { clicks: number; shares: number; conversions: number }>();
    for (const e of events) {
        const date = new Date(e.createdAt).toISOString().slice(0, 10);
        const entry = trendMap.get(date) ?? { clicks: 0, shares: 0, conversions: 0 };
        if (e.eventType === "CLICK") entry.clicks++;
        else if (e.eventType === "SHARE") entry.shares++;
        else if (e.eventType === "CONVERSION") entry.conversions++;
        trendMap.set(date, entry);
    }
    const engagementTrend: EngagementTimelinePoint[] = Array.from(trendMap.entries())
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Fundraising
    const toNum = (val: unknown): number => {
        if (val !== null && typeof val === "object" && typeof (val as { toNumber(): number }).toNumber === "function") {
            return (val as { toNumber(): number }).toNumber();
        }
        return Number(val);
    };
    const verified = donations.filter(
        (d) => d.status === "VERIFIED" || d.status === "RECEIVED"
    );
    const totalRaised = verified.reduce((s, d) => s + toNum(d.amount), 0);
    const donorIds = new Set(verified.map((d) => d.userId));

    const donorTotals = new Map<string, { userId: string; firstName: string; lastName: string; total: number }>();
    for (const d of verified) {
        const existing = donorTotals.get(d.userId);
        if (existing) {
            existing.total += toNum(d.amount);
        } else {
            donorTotals.set(d.userId, {
                userId: d.userId,
                firstName: d.user.firstName,
                lastName: d.user.lastName,
                total: toNum(d.amount),
            });
        }
    }

    const fundraising: DonationStats = {
        campaignId,
        totalRaised,
        donorCount: donorIds.size,
        conversionRate: participations.length > 0
            ? Number(((donorIds.size / participations.length) * 100).toFixed(1))
            : 0,
        topDonors: Array.from(donorTotals.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 10),
    };

    const result: CampaignAnalytics = {
        participants: participations.length,
        growth,
        topPerformers,
        engagementTrend,
        fundraising,
    };

    await redis.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Overview Analytics (Admin) ───────────────────────────────────────────────

export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
    const cacheKey = "analytics:overview";
    const cached = await redis.get<OverviewAnalytics>(cacheKey);
    if (cached) return cached;

    const [totalUsers, activeCampaigns, totalDonationsCount, pointEntries, topCampaignsRaw] =
        await Promise.all([
            prisma.user.count(),
            prisma.campaign.count({ where: { status: "ACTIVE" as never } }),
            prisma.donation.count(),
            prisma.pointsLedgerEntry.aggregate({ _sum: { value: true } }),
            prisma.campaign.findMany({
                where: { status: "ACTIVE" as never },
                orderBy: { participantCount: "desc" },
                take: 5,
                select: { id: true, title: true, participantCount: true },
            }),
        ]);

    const result: OverviewAnalytics = {
        totalUsers,
        activeCampaigns,
        totalDonations: totalDonationsCount,
        totalPoints: pointEntries._sum.value ?? 0,
        topCampaigns: topCampaignsRaw.map((c) => ({
            id: c.id,
            title: c.title,
            participants: c.participantCount ?? 0,
        })),
    };

    await redis.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── Team Analytics ───────────────────────────────────────────────────────────

export async function getTeamAnalytics(teamId: string) {
    const cacheKey = `analytics:team:${teamId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            members: { select: { id: true, firstName: true, lastName: true } },
            group: { select: { name: true } },
        },
    });
    if (!team) return null;

    const memberIds = team.members.map((m) => m.id);

    const [pointEntries, events] = await Promise.all([
        prisma.pointsLedgerEntry.findMany({
            where: { userId: { in: memberIds } },
        }),
        prisma.linkEvent.findMany({
            where: { smartLink: { userId: { in: memberIds } } },
        }),
    ]);

    const totalPoints = pointEntries.reduce((s, p) => s + p.value, 0);
    const clicks = events.filter((e) => e.eventType === "CLICK").length;
    const shares = events.filter((e) => e.eventType === "SHARE").length;
    const conversions = events.filter((e) => e.eventType === "CONVERSION").length;

    // Per-member breakdown
    const memberBreakdown = team.members.map((m) => {
        const memberPoints = pointEntries
            .filter((p) => p.userId === m.id)
            .reduce((s, p) => s + p.value, 0);
        return {
            userId: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            points: memberPoints,
        };
    });

    const result = {
        teamId,
        teamName: team.name,
        groupName: team.group?.name ?? "Unassigned",
        memberCount: memberIds.length,
        totalPoints,
        clicks,
        shares,
        conversions,
        memberBreakdown: memberBreakdown.sort((a, b) => b.points - a.points),
    };

    await redis.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}

// ─── All Teams Analytics (Admin) ──────────────────────────────────────────────

export async function getAllTeamsAnalytics() {
    const cacheKey = "analytics:teams:all";
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const teams = await prisma.team.findMany({
        include: {
            members: { select: { id: true } },
            group: { select: { name: true } },
        },
    });

    // Get all point entries at once for efficiency
    const allMemberIds = teams.flatMap((t) => t.members.map((m) => m.id));
    const allPoints = await prisma.pointsLedgerEntry.findMany({
        where: { userId: { in: allMemberIds } },
    });
    const userPointMap = new Map<string, number>();
    for (const p of allPoints) {
        userPointMap.set(p.userId, (userPointMap.get(p.userId) ?? 0) + p.value);
    }

    const result = teams
        .map((team) => {
            const memberIds = team.members.map((m) => m.id);
            const totalPoints = memberIds.reduce(
                (s, mid) => s + (userPointMap.get(mid) ?? 0),
                0
            );
            return {
                teamId: team.id,
                teamName: team.name,
                groupName: team.group?.name ?? "Unassigned",
                memberCount: memberIds.length,
                totalPoints,
            };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);

    await redis.set(cacheKey, result, CACHE_TTL_ANALYTICS);
    return result;
}
