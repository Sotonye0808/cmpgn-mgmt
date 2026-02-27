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

    const allEvents = await mockDb.linkEvents.findMany({
        where: campaignId ? { userId } : { userId },
    });

    // filter by campaign if given
    let events = allEvents;
    if (campaignId) {
        const userLinks = await mockDb.smartLinks.findMany({ where: { userId, campaignId } });
        const linkIds = new Set(userLinks.map((l) => l.id));
        events = allEvents.filter((e) => e.linkId && linkIds.has(e.linkId));
    }

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
    const allEvents = await mockDb.linkEvents.findMany({ where: { userId } });

    let events = allEvents;
    if (campaignId) {
        const userLinks = await mockDb.smartLinks.findMany({ where: { userId, campaignId } });
        const linkIds = new Set(userLinks.map((l) => l.id));
        events = allEvents.filter((e) => e.linkId && linkIds.has(e.linkId));
    }

    const now = new Date();
    const points: EngagementTimelinePoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
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
