import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getCampaignFundraisingStats } from "@/modules/donation/services/donationService";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const stats = await getCampaignFundraisingStats(id);
        return successResponse(stats);
    } catch (err) {
        return handleApiError(err);
    }
}
