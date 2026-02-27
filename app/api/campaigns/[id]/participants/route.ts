import { NextRequest } from "next/server";
import {
    successResponse,
    handleApiError,
    paginatedResponse,
    notFoundResponse,
} from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import {
    joinCampaign,
    getCampaignParticipants,
    getCampaignById,
} from "@/modules/campaign/services/campaignService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const sp = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") ?? "10", 10)));

        const campaign = await getCampaignById(id);
        if (!campaign) return notFoundResponse("Campaign not found");

        const result = await getCampaignParticipants(id, { page, pageSize });
        return paginatedResponse(result.data, result.pagination.total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const { id } = await params;
        const campaign = await getCampaignById(id);
        if (!campaign) return notFoundResponse("Campaign not found");

        const participation = await joinCampaign(user.id, id);
        return successResponse(participation, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
