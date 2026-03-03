import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { getTeamWithMembers } from "@/modules/teams";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const result = await getTeamWithMembers(id);
        if (!result) return notFoundResponse("Team not found");

        return successResponse(result);
    } catch (err) {
        return handleApiError(err);
    }
}
