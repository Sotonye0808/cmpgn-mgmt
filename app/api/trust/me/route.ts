import { requireAuth } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getUserTrustScore } from "@/modules/trust/services/trustService";

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const score = await getUserTrustScore(user.id);
        return successResponse(score);
    } catch (err) {
        return handleApiError(err);
    }
}
