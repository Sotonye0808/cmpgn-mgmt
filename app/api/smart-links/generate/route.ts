import { NextRequest } from "next/server";
import { successResponse, handleApiError, badRequestResponse } from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import { generateLink } from "@/modules/links/services/linkService";

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const body = await request.json();
        const { campaignId, customAlias } = body;
        if (!campaignId) return badRequestResponse("campaignId is required");

        const link = await generateLink({ userId: user.id, campaignId, customAlias });
        return successResponse(link, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
