import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getReferralStats, getTopReferrers } from "@/modules/referral/services/referralService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN", "TEAM_LEAD"]);
        if (auth.error) return auth.error;

        const { id: campaignId } = await params;
        const [summary, topReferrers] = await Promise.all([
            getReferralStats("aggregate", campaignId),
            getTopReferrers(campaignId, 10),
        ]);
        return successResponse({ summary, topReferrers });
    } catch (err) {
        return handleApiError(err);
    }
}
