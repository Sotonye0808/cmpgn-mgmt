import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getOverviewAnalytics } from "@/modules/analytics/services/analyticsService";

export async function GET() {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const overview = await getOverviewAnalytics();
        return successResponse(overview);
    } catch (err) {
        return handleApiError(err);
    }
}
