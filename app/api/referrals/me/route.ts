import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getReferralStats } from "@/modules/referral/services/referralService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;
        const stats = await getReferralStats(user.id, campaignId);
        return successResponse(stats);
    } catch (err) {
        return handleApiError(err);
    }
}
