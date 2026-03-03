import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { getTeamMemberStats } from "@/modules/teams";

// GET /api/teams/[id]/stats — Authenticated; returns per-member stats sorted by points
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const stats = await getTeamMemberStats(id);
        if (!stats) return notFoundResponse("Team not found");

        return successResponse(stats);
    } catch (err) {
        return handleApiError(err);
    }
}
