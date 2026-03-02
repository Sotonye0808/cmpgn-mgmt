/**
 * Public stats service — computes platform-wide stats for public pages.
 *
 * Architecture notes:
 * - Uses mockDb directly (server-only). At Phase 14, swap mockDb calls to Prisma queries.
 * - Uses mockCache with a 5-minute TTL to avoid hammering the DB on every page render.
 *   At Phase 14, replace mockCache.get/set with Redis get/setex calls — same interface.
 * - This module is intentionally "use server" free — it's imported only from
 *   API routes and server components, never from client components.
 */

import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";

export interface PublicStat {
    key: string;
    label: string;
    value: string;
}

const CACHE_KEY = "public:stats";
const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 1_000) return `${Math.floor(n / 1_000).toLocaleString()}K+`;
    return n.toLocaleString();
}

/**
 * Returns live platform stats, served from cache when available.
 * Safe to call from any server context (API route, page, layout).
 */
export function getPublicStats(): PublicStat[] {
    const cached = mockCache.get<PublicStat[]>(CACHE_KEY);
    if (cached) return cached;

    // ── Aggregate from DB ──────────────────────────────────────────────────────
    // Phase 14: replace each block with the equivalent Prisma aggregate query.

    const totalUsers = mockDb.users.findMany().length;

    const activeCampaigns = mockDb.campaigns.findMany({
        where: { status: "ACTIVE" as unknown as CampaignStatus },
    }).length;

    const totalLinkEvents = mockDb.linkEvents.findMany().length;

    const totalReferrals = mockDb.referrals.findMany().length;
    const conversionRate =
        totalLinkEvents > 0
            ? Math.round((totalReferrals / totalLinkEvents) * 100)
            : 0;

    // ── Shape into display items ───────────────────────────────────────────────
    const stats: PublicStat[] = [
        {
            key: "ammo",
            label: "Ammunition Deployed",
            value: formatCount(totalLinkEvents),
        },
        {
            key: "missions",
            label: "Active Missions",
            value: formatCount(activeCampaigns),
        },
        {
            key: "soldiers",
            label: "Digital Soldiers",
            value: formatCount(totalUsers),
        },
        {
            key: "conversions",
            label: "Conversion Rate",
            value: `${conversionRate}%`,
        },
    ];

    mockCache.set(CACHE_KEY, stats, CACHE_TTL_MS);
    return stats;
}
