import { successResponse, handleApiError } from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/campaigns/joined
 * Returns the list of campaign IDs that the authenticated user has joined.
 */
export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const participations = await prisma.campaignParticipation.findMany({
            where: { userId: auth.user.id },
        });

        const campaignIds = participations.map((p) => p.campaignId);
        return successResponse({ campaignIds });
    } catch (err) {
        return handleApiError(err);
    }
}
