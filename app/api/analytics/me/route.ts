import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getUserAnalytics } from "@/modules/analytics/services/analyticsService";

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const analytics = await getUserAnalytics(user.id);
        return successResponse(analytics);
    } catch (err) {
        return handleApiError(err);
    }
}
