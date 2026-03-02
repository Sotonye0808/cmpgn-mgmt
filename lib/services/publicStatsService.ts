import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CACHE_KEY = "public:stats";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export interface PublicStatItem {
    key: string;
    label: string;
    value: string;
}

export async function getPublicStats(): Promise<PublicStatItem[]> {
    const cached = await redis.get<PublicStatItem[]>(CACHE_KEY);
    if (cached) return cached;

    const [totalUsers, activeCampaigns, totalEngagements, totalReferrals] =
        await Promise.all([
            prisma.user.count(),
            prisma.campaign.count({ where: { status: "ACTIVE" as never } }),
            prisma.linkEvent.count(),
            prisma.referral.count(),
        ]);

    const result: PublicStatItem[] = [
        { key: "users", label: "Total Soldiers", value: totalUsers.toLocaleString() },
        { key: "campaigns", label: "Active Campaigns", value: activeCampaigns.toLocaleString() },
        { key: "engagements", label: "Engagements", value: totalEngagements.toLocaleString() },
        { key: "referrals", label: "Referrals", value: totalReferrals.toLocaleString() },
    ];

    await redis.set(CACHE_KEY, result, CACHE_TTL);
    return result;
}

