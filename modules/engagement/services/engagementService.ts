import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { CACHE_TTL_ENGAGEMENT } from "@/lib/constants";

// ─── Get user engagement stats ────────────────────────────────────────────────
export async function getUserEngagement(
    userId: string,
    campaignId?: string,
): Promise<EngagementStats> {
    const cacheKey = campaignId
        ? `engagement:user:${userId}:campaign:${campaignId}`
        : `engagement:user:${userId}`;
    const cached = mockCache.get<EngagementStats>(cacheKey);
    if (cached) return cached;

    // Events are attributed to users via their smart links, not a userId field.
    // Resolve user's link IDs first, then filter events by those IDs.
    const userLinks = await mockDb.smartLinks.findMany({
        where: campaignId ? { userId, campaignId } : { userId },
    });
    const linkIds = new Set(userLinks.map((l) => l.id));

    const allEvents = await mockDb.linkEvents.findMany({});
    const events = allEvents.filter((e) => e.linkId && linkIds.has(e.linkId));

    const stats: EngagementStats = {
        userId,
        campaignId,
        clicks: events.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
        views: events.filter((e) => (e.eventType ?? e.type) === "VIEW").length,
        shares: events.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
        conversions: events.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        referrals: 0, // populated from referral module
        uniqueVisitors: new Set(events.map((e) => e.ipHash ?? e.ipAddress ?? "")).size,
    };

    // add referral count
    const referrals = await mockDb.referrals.findMany({
        where: campaignId ? { inviterId: userId, campaignId } : { inviterId: userId },
    });
    stats.referrals = referrals.length;

    mockCache.set(cacheKey, stats, CACHE_TTL_ENGAGEMENT);
    return stats;
}

// ─── Get campaign aggregate engagement ────────────────────────────────────────
export async function getCampaignEngagement(campaignId: string): Promise<EngagementStats> {
    const cacheKey = `engagement:campaign:${campaignId}`;
    const cached = mockCache.get<EngagementStats>(cacheKey);
    if (cached) return cached;

    const campaignLinks = await mockDb.smartLinks.findMany({ where: { campaignId } });
    const linkIds = new Set(campaignLinks.map((l) => l.id));

    const allEvents = await mockDb.linkEvents.findMany({});
    const events = allEvents.filter((e) => e.linkId && linkIds.has(e.linkId));

    const referrals = await mockDb.referrals.findMany({ where: { campaignId } });

    const stats: EngagementStats = {
        userId: "aggregate",
        campaignId,
        clicks: events.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
        views: events.filter((e) => (e.eventType ?? e.type) === "VIEW").length,
        shares: events.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
        conversions: events.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        referrals: referrals.length,
        uniqueVisitors: new Set(events.map((e) => e.ipHash ?? e.ipAddress ?? "")).size,
    };

    mockCache.set(cacheKey, stats, CACHE_TTL_ENGAGEMENT);
    return stats;
}

// ─── Get engagement timeline ───────────────────────────────────────────────────
export async function getEngagementTimeline(
    userId: string,
    campaignId?: string,
    days = 14,
): Promise<EngagementTimelinePoint[]> {
    // LinkEvent has no userId field — join through smartLinks to get the user's linkIds
    const userLinks = await mockDb.smartLinks.findMany(
        campaignId ? { where: { userId, campaignId } } : { where: { userId } },
    );
    const linkIds = new Set(userLinks.map((l) => l.id));
    const allEvents = await mockDb.linkEvents.findMany();
    const events = allEvents.filter((e) => e.linkId && linkIds.has(e.linkId));

    const now = new Date();
    const points: EngagementTimelinePoint[] = [];

    // days=0 means "all time" — generate points back to the earliest event
    const windowSize = days === 0
        ? (() => {
            if (events.length === 0) return 30;
            const earliest = events.reduce((min, e) =>
                e.createdAt < min ? e.createdAt : min, events[0].createdAt);
            const diffMs = now.getTime() - new Date(earliest).getTime();
            return Math.max(7, Math.ceil(diffMs / 86_400_000));
        })()
        : days;

    for (let i = windowSize - 1; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        const dateStr = day.toISOString().slice(0, 10);

        const dayEvents = events.filter((e) => e.createdAt.slice(0, 10) === dateStr);
        points.push({
            date: dateStr,
            clicks: dayEvents.filter((e) => (e.eventType ?? e.type) === "CLICK").length,
            shares: dayEvents.filter((e) => (e.eventType ?? e.type) === "SHARE").length,
            conversions: dayEvents.filter((e) => (e.eventType ?? e.type) === "CONVERSION").length,
        });
    }

    return points;
}
