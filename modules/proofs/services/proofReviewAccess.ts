import { prisma } from "@/lib/prisma";

// ─── Proof Review Access ─────────────────────────────────────────────────────
// Centralizes the rule for "which proofs may a reviewer see / verify".
//
// Admins: unrestricted.
// Team leads: scoped to proofs submitted by members of their team, and — when
// the lead has been assigned to campaigns (Campaign.teamLeadIds) — only for
// those campaigns. A team lead with no campaign assignments keeps the legacy
// team-scoped behaviour so existing setups don't lose access.

export interface ProofReviewAccessContext {
    isAdmin: boolean;
    /** Campaign ids the reviewer is assigned to verify (empty for admins) */
    managedCampaignIds: string[];
    /** Ids of the reviewer's team members (empty when the reviewer has no team) */
    teamMemberIds: string[];
}

/**
 * Build the authorization context for a reviewer. Safe to call once per
 * request and reuse across many proofs (avoids N+1 inside batch review).
 */
export async function buildProofReviewAccess(
    authUser: AuthUser
): Promise<ProofReviewAccessContext> {
    const isAdmin =
        authUser.role === "ADMIN" || authUser.role === "SUPER_ADMIN";
    if (isAdmin) {
        return { isAdmin: true, managedCampaignIds: [], teamMemberIds: [] };
    }

    const [ledCampaigns, userRow] = await Promise.all([
        prisma.campaign.findMany({
            where: { teamLeadIds: { has: authUser.id } },
            select: { id: true },
        }),
        prisma.user.findUnique({
            where: { id: authUser.id },
            select: { teamId: true },
        }),
    ]);

    let teamMemberIds: string[] = [];
    if (userRow?.teamId) {
        const members = await prisma.user.findMany({
            where: { teamId: userRow.teamId },
            select: { id: true },
        });
        teamMemberIds = members.map((m: { id: string }) => m.id);
    }

    return {
        isAdmin: false,
        managedCampaignIds: ledCampaigns.map((c: { id: string }) => c.id),
        teamMemberIds,
    };
}

/**
 * Whether a given proof falls inside the reviewer's permitted scope.
 */
export function canReviewProof(
    ctx: ProofReviewAccessContext,
    proof: Pick<ViewProof, "userId" | "campaignId">,
    reviewerId: string
): boolean {
    if (ctx.isAdmin) return true;

    const inScopeUsers =
        ctx.teamMemberIds.length > 0 ? ctx.teamMemberIds : [reviewerId];
    if (!inScopeUsers.includes(proof.userId)) return false;

    if (
        ctx.managedCampaignIds.length > 0 &&
        !ctx.managedCampaignIds.includes(proof.campaignId)
    ) {
        return false;
    }

    return true;
}
