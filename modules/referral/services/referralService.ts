import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// ─── Attribute a referral (called post-register when ?ref={slug} is present) ──
export async function attributeReferral(
    slug: string,
    registeredUserId: string,
): Promise<Referral | null> {
    // Idempotent: don't double-attribute
    const existing = await prisma.referral.findUnique({
        where: { inviteeId_slug: { inviteeId: registeredUserId, slug } },
    });
    if (existing) {
        return {
            ...existing,
            createdAt: existing.createdAt.toISOString(),
        } as unknown as Referral;
    }

    // Find the smart link by slug to get the inviter + campaign
    const link = await prisma.smartLink.findUnique({ where: { slug } });
    if (!link) return null;
    if (link.userId === registeredUserId) return null; // can't refer yourself

    const referral = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const newReferral = await tx.referral.create({
            data: {
                inviterId: link.userId,
                inviteeId: registeredUserId,
                campaignId: link.campaignId,
                slug,
                createdAt: now,
            },
        });

        // increment conversion on the smart link
        await tx.smartLink.update({
            where: { id: link.id },
            data: { conversionCount: { increment: 1 }, updatedAt: now },
        });

        await redis.invalidatePattern(`referrals:user:${link.userId}`);
        await redis.invalidatePattern(`engagement:user:${link.userId}`);

        return newReferral;
    });

    return {
        ...referral,
        createdAt: referral.createdAt.toISOString(),
    } as unknown as Referral;
}

// ─── Get referral stats for a user ────────────────────────────────────────────
export async function getReferralStats(
    userId: string,
    campaignId?: string,
): Promise<ReferralStats> {
    const cacheKey = campaignId
        ? `referrals:user:${userId}:campaign:${campaignId}`
        : `referrals:user:${userId}`;
    const cached = await redis.get<ReferralStats>(cacheKey);
    if (cached) return cached;

    const all = await prisma.referral.findMany({
        where: campaignId ? { inviterId: userId, campaignId } : { inviterId: userId },
    });

    // "active" = invitee is still an active user
    const inviteeIds = all.map((r) => r.inviteeId);
    const activeCount = await prisma.user.count({
        where: { id: { in: inviteeIds }, isActive: true },
    });

    // invitees with a participation are counted as converted
    const convertedCount = await prisma.campaignParticipation.count({
        where: {
            userId: { in: inviteeIds },
            ...(campaignId ? { campaignId } : {}),
        },
    });

    const stats: ReferralStats = {
        userId,
        campaignId,
        totalReferrals: all.length,
        activeReferrals: activeCount,
        conversionRate: all.length > 0 ? convertedCount / all.length : 0,
        directInvites: all.length,
    };

    await redis.set(cacheKey, stats, 30_000);
    return stats;
}

// ─── Get top referrers for a campaign (for leaderboard input) ─────────────────
export async function getTopReferrers(
    campaignId: string,
    limit = 10,
): Promise<Array<{ userId: string; count: number }>> {
    const all = await prisma.referral.findMany({ where: { campaignId } });
    const counts: Record<string, number> = {};
    for (const r of all) {
        counts[r.inviterId] = (counts[r.inviterId] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
