import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getLeaderboard } from "@/modules/leaderboard/services/leaderboardService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id: campaignId } = await params;

        const data = await getLeaderboard("individual", campaignId);
        return successResponse(data);
    } catch (err) {
        return handleApiError(err);
    }
}
