import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";

// ─── Attribute a referral (called post-register when ?ref={slug} is present) ──
export async function attributeReferral(
    slug: string,
    registeredUserId: string,
): Promise<Referral | null> {
    // Idempotent: don't double-attribute
    const existing = await mockDb.referrals.findUnique({
        where: { inviteeId_slug: { inviteeId: registeredUserId, slug } },
    });
    if (existing) return existing;

    // Find the smart link by slug to get the inviter + campaign
    const link = await mockDb.smartLinks.findUnique({ where: { slug } });
    if (!link) return null;
    if (link.userId === registeredUserId) return null; // can't refer yourself

    const referral = await mockDb.transaction(async (tx) => {
        const now = new Date().toISOString();
        const newReferral: Referral = {
            id: crypto.randomUUID(),
            inviterId: link.userId,
            inviteeId: registeredUserId,
            campaignId: link.campaignId,
            slug,
            createdAt: now,
        };
        await tx.referrals.create({ data: newReferral });
        mockDb.emit("referrals:changed");

        // increment conversion on the smart link
        const existing = await tx.smartLinks.findUnique({ where: { id: link.id } });
        if (existing) {
            await tx.smartLinks.update({
                where: { id: link.id },
                data: { conversionCount: existing.conversionCount + 1, updatedAt: now },
            });
        }

        mockCache.invalidatePattern(`referrals:user:${link.userId}`);
        mockCache.invalidatePattern(`engagement:user:${link.userId}`);

        return newReferral;
    });

    return referral;
}

// ─── Get referral stats for a user ────────────────────────────────────────────
export async function getReferralStats(
    userId: string,
    campaignId?: string,
): Promise<ReferralStats> {
    const cacheKey = campaignId
        ? `referrals:user:${userId}:campaign:${campaignId}`
        : `referrals:user:${userId}`;
    const cached = mockCache.get<ReferralStats>(cacheKey);
    if (cached) return cached;

    const all = await mockDb.referrals.findMany({
        where: campaignId ? { inviterId: userId, campaignId } : { inviterId: userId },
    });

    // "active" = invitee is still an active user
    const inviteeIds = all.map((r) => r.inviteeId);
    const invitees = await Promise.all(
        inviteeIds.map((id) => mockDb.users.findUnique({ where: { id } })),
    );
    const activeCount = invitees.filter((u) => u?.isActive).length;

    // inviters with a participation are counted as converted
    const inviteesWithParticipation = await mockDb.participations.findMany({
        where: campaignId ? { campaignId } : {},
    });
    const convertedIds = new Set(
        inviteesWithParticipation.filter((p) => inviteeIds.includes(p.userId)).map((p) => p.userId),
    );

    const stats: ReferralStats = {
        userId,
        campaignId,
        totalReferrals: all.length,
        activeReferrals: activeCount,
        conversionRate: all.length > 0 ? convertedIds.size / all.length : 0,
        directInvites: all.length,
    };

    mockCache.set(cacheKey, stats, 30_000);
    return stats;
}

// ─── Get top referrers for a campaign (for leaderboard input) ─────────────────
export async function getTopReferrers(
    campaignId: string,
    limit = 10,
): Promise<Array<{ userId: string; count: number }>> {
    const all = await mockDb.referrals.findMany({ where: { campaignId } });
    const counts: Record<string, number> = {};
    for (const r of all) {
        counts[r.inviterId] = (counts[r.inviterId] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
