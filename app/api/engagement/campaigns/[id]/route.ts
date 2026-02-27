import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError, notFoundResponse } from "@/lib/utils/api";
import { getCampaignEngagement } from "@/modules/engagement/services/engagementService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN", "TEAM_LEAD"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const stats = await getCampaignEngagement(id);
        if (!stats) return notFoundResponse("Campaign not found");
        return successResponse(stats);
    } catch (err) {
        return handleApiError(err);
    }
}
