import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getUserRank } from "@/modules/leaderboard/services/leaderboardService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;
        const rankInfo = await getUserRank(user.id, campaignId);
        return successResponse(rankInfo);
    } catch (err) {
        return handleApiError(err);
    }
}
