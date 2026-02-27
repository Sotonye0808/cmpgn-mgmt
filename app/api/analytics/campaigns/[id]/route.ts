import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getCampaignAnalytics } from "@/modules/analytics/services/analyticsService";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const analytics = await getCampaignAnalytics(id);
        return successResponse(analytics);
    } catch (err) {
        return handleApiError(err);
    }
}
