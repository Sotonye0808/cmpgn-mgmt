import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { paginatedResponse, handleApiError } from "@/lib/utils/api";
import { getLeaderboard } from "@/modules/leaderboard/services/leaderboardService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const sp = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") ?? "20", 10)));

        const { data, total } = await getLeaderboard("global", undefined, page, pageSize);
        return paginatedResponse(data, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}
