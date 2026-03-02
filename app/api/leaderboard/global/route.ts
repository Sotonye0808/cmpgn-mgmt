import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getLeaderboard } from "@/modules/leaderboard/services/leaderboardService";

export async function GET(_request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const data = await getLeaderboard("global");
        return successResponse(data);
    } catch (err) {
        return handleApiError(err);
    }
}
