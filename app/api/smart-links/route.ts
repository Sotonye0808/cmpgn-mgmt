import { NextRequest } from "next/server";
import {
    successResponse,
    handleApiError,
    paginatedResponse,
} from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import { getLinksByUser, getLinksByCampaign } from "@/modules/links/services/linkService";

// GET /api/smart-links?campaignId=... or ?userId=...
export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const sp = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") ?? "10", 10)));
        const campaignId = sp.get("campaignId") ?? undefined;

        if (campaignId) {
            const result = await getLinksByCampaign({ campaignId, page, pageSize });
            return paginatedResponse(result.data, result.meta.total, result.meta.page, result.meta.pageSize);
        }

        // Default: return the current user's links
        const links = await getLinksByUser(user.id);
        return successResponse(links);
    } catch (err) {
        return handleApiError(err);
    }
}
