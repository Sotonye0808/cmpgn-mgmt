import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getAllTeamsAnalytics } from "@/modules/analytics/services/analyticsService";

export async function GET() {
    try {
        const auth = await requireRole(["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const analytics = await getAllTeamsAnalytics();
        return successResponse(analytics);
    } catch (err) {
        return handleApiError(err);
    }
}
