import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { mockDb } from "@/lib/data/mockDb";
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
        const allCampaigns = mockDb.campaigns.findMany();

        // Campaigns the user has participated in
        const participationCampaignIds = new Set(
            mockDb.participations._data
                .filter((p) => p.userId === userId)
                .map((p) => p.campaignId)
        );
        const joined = allCampaigns.filter((c) => participationCampaignIds.has(c.id));

        // Campaigns the user created (applies to ADMIN/SUPER_ADMIN)
        const created = allCampaigns.filter((c) => c.createdById === userId);

        return successResponse<MyCampaignsResult>({ joined, created });
    } catch (error) {
        return handleApiError(error);
    }
}
