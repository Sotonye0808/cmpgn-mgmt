import { NextRequest } from "next/server";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
    badRequestResponse,
} from "@/lib/utils/api";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import {
    getCampaignById,
    updateCampaign,
} from "@/modules/campaign/services/campaignService";
import { updateCampaignSchema } from "@/lib/schemas/campaignSchemas";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const campaign = await getCampaignById(id);
        if (!campaign) return notFoundResponse("Campaign not found");
        return successResponse(campaign);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const parsed = updateCampaignSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(JSON.stringify(parsed.error.flatten().fieldErrors));
        }

        const campaign = await updateCampaign(id, parsed.data as UpdateCampaignInput);
        if (!campaign) return notFoundResponse("Campaign not found");
        return successResponse(campaign);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const existing = await getCampaignById(id);
        if (!existing) return notFoundResponse("Campaign not found");

        // Soft-delete: archive the campaign
        const campaign = await updateCampaign(id, { status: "ARCHIVED" as CampaignStatus });
        return successResponse(campaign);
    } catch (err) {
        return handleApiError(err);
    }
}
