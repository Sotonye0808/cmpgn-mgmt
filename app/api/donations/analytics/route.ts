import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getDonationAnalytics } from "@/modules/donation/services/donationService";

export async function GET() {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const analytics = await getDonationAnalytics();
        return successResponse(analytics);
    } catch (err) {
        return handleApiError(err);
    }
}
