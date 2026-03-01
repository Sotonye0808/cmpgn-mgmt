import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getEngagementTimeline } from "@/modules/engagement/services/engagementService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const sp = request.nextUrl.searchParams;
        const campaignId = sp.get("campaignId") ?? undefined;
        const raw = parseInt(sp.get("days") ?? "14", 10);
        // 0 = all-time; otherwise clamp to 7–90
        const days = raw === 0 ? 0 : Math.min(90, Math.max(7, raw));

        const timeline = await getEngagementTimeline(user.id, campaignId, days);
        return successResponse(timeline);
    } catch (err) {
        return handleApiError(err);
    }
}
