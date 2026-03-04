import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/** Points awarded to a referrer when a new user signs up via their link */
const REFERRAL_SIGNUP_POINTS = 5;

/** Percentage (0–1) of a referree's earned points that cascade to their referrer */
export const REFERRAL_CASCADE_PERCENT = 0.1;

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

        // Update goalCurrent for REFERRALS-type campaigns
        const campaign = await tx.campaign.findUnique({
            where: { id: link.campaignId },
            select: { goalType: true },
        });
        if (campaign?.goalType === "REFERRALS") {
            await tx.campaign.update({
                where: { id: link.campaignId },
                data: { goalCurrent: { increment: 1 } },
            });
        }

        // Award LEADERSHIP points to the referrer for the signup itself
        await tx.pointsLedgerEntry.create({
            data: {
                userId: link.userId,
                campaignId: link.campaignId,
                type: "LEADERSHIP" as never,
                value: REFERRAL_SIGNUP_POINTS,
                description: "Referral signup bonus",
                referenceId: newReferral.id,
            },
        });

        await redis.invalidatePattern(`referrals:user:${link.userId}`);
        await redis.invalidatePattern(`engagement:user:${link.userId}`);
        await redis.del(`points:summary:${link.userId}`);

        return newReferral;
    });

    return {
        ...referral,
        createdAt: referral.createdAt.toISOString(),
    } as unknown as Referral;
}

// ─── Award referral cascade points ────────────────────────────────────────────
/**
 * When a referred user (invitee) earns points, a percentage cascades to the referrer.
 * Call this AFTER the primary points entry has been written.
 *
 * @param inviteeId  The user who just earned points
 * @param campaignId The campaign context (used to find the referral relationship)
 * @param earnedPoints The points the invitee just earned
 */
export async function awardReferralCascade(
    inviteeId: string,
    campaignId: string,
    earnedPoints: number,
): Promise<void> {
    if (earnedPoints <= 0) return;

    const referral = await prisma.referral.findFirst({
        where: { inviteeId, campaignId },
    });
    if (!referral) return;

    const cascadeValue = Math.max(1, Math.round(earnedPoints * REFERRAL_CASCADE_PERCENT));

    await prisma.pointsLedgerEntry.create({
        data: {
            userId: referral.inviterId,
            campaignId,
            type: "LEADERSHIP" as never,
            value: cascadeValue,
            description: `Referral cascade (${Math.round(REFERRAL_CASCADE_PERCENT * 100)}% of referree contribution)`,
            referenceId: referral.id,
        },
    });

    await Promise.all([
        redis.del(`points:summary:${referral.inviterId}`),
        redis.invalidatePattern(`engagement:user:${referral.inviterId}`),
    ]);
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
