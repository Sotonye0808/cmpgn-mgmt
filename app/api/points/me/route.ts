import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import {
    getPointsSummary,
    getRankProgress,
} from "@/modules/points/services/pointsService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;
        const [summary, progress] = await Promise.all([
            getPointsSummary(user.id, campaignId),
            getRankProgress(user.id),
        ]);
        return successResponse({ summary, progress });
    } catch (err) {
        return handleApiError(err);
    }
}
