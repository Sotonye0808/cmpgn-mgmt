import { NextRequest } from "next/server";
import { z } from "zod";
import {
    successResponse,
    handleApiError,
    paginatedResponse,
    badRequestResponse,
} from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import { getLinksByUser, getLinksByCampaign, generateLink } from "@/modules/links/services/linkService";

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

const generateLinkSchema = z.object({
    campaignId: z.string().min(1, "Campaign ID is required"),
    customAlias: z.string().min(3).max(20).optional(),
});

// POST /api/smart-links — generate (or return existing) smart link for a campaign
export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const body = await request.json();
        const parsed = generateLinkSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const link = await generateLink({
            userId: user.id,
            campaignId: parsed.data.campaignId,
            customAlias: parsed.data.customAlias,
        });

        return successResponse(link, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
