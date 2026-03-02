import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { CACHE_TTL_ENGAGEMENT } from "@/lib/constants";

// ─── Get user engagement stats ────────────────────────────────────────────────
export async function getUserEngagement(
    userId: string,
    campaignId?: string,
): Promise<EngagementStats> {
    const cacheKey = campaignId
        ? `engagement:user:${userId}:campaign:${campaignId}`
        : `engagement:user:${userId}`;
    const cached = await redis.get<EngagementStats>(cacheKey);
    if (cached) return cached;

    // Resolve user's link IDs first, then filter events by those IDs
    const userLinks = await prisma.smartLink.findMany({
        where: campaignId ? { userId, campaignId } : { userId },
        select: { id: true },
    });
    const linkIds = userLinks.map((l) => l.id);

    const events = await prisma.linkEvent.findMany({
        where: { linkId: { in: linkIds } },
    });

    const stats: EngagementStats = {
        userId,
        campaignId,
        clicks: events.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
        views: events.filter((e) => (e.eventType ?? e.type) === "VIEW").length,
        shares: events.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
        conversions: events.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        referrals: 0,
        uniqueVisitors: new Set(events.map((e) => e.ipHash ?? e.ipAddress ?? "")).size,
    };

    const referralCount = await prisma.referral.count({
        where: campaignId ? { inviterId: userId, campaignId } : { inviterId: userId },
    });
    stats.referrals = referralCount;

    await redis.set(cacheKey, stats, CACHE_TTL_ENGAGEMENT);
    return stats;
}

// ─── Get campaign aggregate engagement ────────────────────────────────────────
export async function getCampaignEngagement(campaignId: string): Promise<EngagementStats> {
    const cacheKey = `engagement:campaign:${campaignId}`;
    const cached = await redis.get<EngagementStats>(cacheKey);
    if (cached) return cached;

    const campaignLinks = await prisma.smartLink.findMany({
        where: { campaignId },
        select: { id: true },
    });
    const linkIds = campaignLinks.map((l) => l.id);

    const events = await prisma.linkEvent.findMany({
        where: { linkId: { in: linkIds } },
    });

    const referralCount = await prisma.referral.count({ where: { campaignId } });

    const stats: EngagementStats = {
        userId: "aggregate",
        campaignId,
        clicks: events.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
        views: events.filter((e) => (e.eventType ?? e.type) === "VIEW").length,
        shares: events.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
        conversions: events.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        referrals: referralCount,
        uniqueVisitors: new Set(events.map((e) => e.ipHash ?? e.ipAddress ?? "")).size,
    };

    await redis.set(cacheKey, stats, CACHE_TTL_ENGAGEMENT);
    return stats;
}

// ─── Get engagement timeline ───────────────────────────────────────────────────
export async function getEngagementTimeline(
    userId: string,
    campaignId?: string,
    days = 14,
): Promise<EngagementTimelinePoint[]> {
    const userLinks = await prisma.smartLink.findMany({
        where: campaignId ? { userId, campaignId } : { userId },
        select: { id: true },
    });
    const linkIds = userLinks.map((l) => l.id);

    const events = await prisma.linkEvent.findMany({
        where: { linkId: { in: linkIds } },
    });

    const now = new Date();
    const points: EngagementTimelinePoint[] = [];

    const windowSize = days === 0
        ? (() => {
            if (events.length === 0) return 30;
            const earliest = events.reduce((min, e) => {
                const t = e.createdAt.toISOString();
                return t < min ? t : min;
            }, events[0].createdAt.toISOString());
            const diffMs = now.getTime() - new Date(earliest).getTime();
            return Math.max(7, Math.ceil(diffMs / 86_400_000));
        })()
        : days;

    for (let i = windowSize - 1; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        const dateStr = day.toISOString().slice(0, 10);

        const dayEvents = events.filter(
            (e) => e.createdAt.toISOString().slice(0, 10) === dateStr
        );
        points.push({
            date: dateStr,
            clicks: dayEvents.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
            shares: dayEvents.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
            conversions: dayEvents.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        });
    }

    return points;
}
