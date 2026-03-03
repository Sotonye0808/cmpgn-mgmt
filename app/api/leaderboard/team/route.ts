import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getTeamLeaderboard } from "@/modules/leaderboard/services/leaderboardService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;

        const data = await getTeamLeaderboard(campaignId);
        return successResponse(data);
    } catch (err) {
        return handleApiError(err);
    }
}
