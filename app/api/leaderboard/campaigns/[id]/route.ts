import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { paginatedResponse, handleApiError } from "@/lib/utils/api";
import { getLeaderboard } from "@/modules/leaderboard/services/leaderboardService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id: campaignId } = await params;

        const sp = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") ?? "20", 10)));

        const all = (await getLeaderboard("individual", campaignId)) as LeaderboardEntry[];
        const total = all.length;
        const start = (page - 1) * pageSize;
        const data = all.slice(start, start + pageSize);

        return paginatedResponse(data, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}
