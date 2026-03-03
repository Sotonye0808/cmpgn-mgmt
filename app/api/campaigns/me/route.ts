import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { serializeArray } from "@/lib/utils/serialize";
import { successResponse, handleApiError } from "@/lib/utils/api";

export interface MyCampaignsResult {
    joined: Campaign[];
    created: Campaign[];
}

/**
 * GET /api/campaigns/me
 * Returns campaigns the authenticated user has joined and created.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const userId = auth.user.id;

        // Campaigns the user has participated in
        const participations = await prisma.campaignParticipation.findMany({
            where: { userId },
            select: { campaignId: true },
        });
        const participationCampaignIds = participations.map((p) => p.campaignId);
        const joinedRaw = participationCampaignIds.length > 0
            ? await prisma.campaign.findMany({ where: { id: { in: participationCampaignIds } } })
            : [];
        const joined = serializeArray<Campaign>(joinedRaw);

        // Campaigns the user created (applies to ADMIN/SUPER_ADMIN)
        const createdRaw = await prisma.campaign.findMany({ where: { createdById: userId } });
        const created = serializeArray<Campaign>(createdRaw);

        return successResponse<MyCampaignsResult>({ joined, created });
    } catch (error) {
        return handleApiError(error);
    }
}
