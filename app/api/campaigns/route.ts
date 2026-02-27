import { NextRequest } from "next/server";
import {
    successResponse,
    paginatedResponse,
    handleApiError,
    badRequestResponse,
} from "@/lib/utils/api";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { listCampaigns, createCampaign } from "@/modules/campaign/services/campaignService";
import { createCampaignSchema } from "@/lib/schemas/campaignSchemas";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const sp = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") ?? "10", 10)));
        const filters: CampaignFilters = {
            search: sp.get("search") ?? undefined,
            status: (sp.get("status") as CampaignStatus) ?? undefined,
            goalType: (sp.get("goalType") as GoalType) ?? undefined,
        };

        const result = await listCampaigns(filters, { page, pageSize }, user);
        return paginatedResponse(result.data, result.pagination.total, result.pagination.page, result.pagination.pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;
        const user = auth.user;

        const body = await request.json();
        const parsed = createCampaignSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(JSON.stringify(parsed.error.flatten().fieldErrors));
        }

        const campaign = await createCampaign(parsed.data as CreateCampaignInput, user.id);
        return successResponse(campaign, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
