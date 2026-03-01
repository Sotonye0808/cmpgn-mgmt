import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { addMemberToTeam, removeMemberFromTeam } from "@/modules/teams";
import { z } from "zod";

const addMemberSchema = z.object({
    userId: z.string().min(1),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN", "TEAM_LEAD"]);
        if (auth.error) return auth.error;

        const { id: teamId } = await params;
        const body = await request.json();
        const parsed = addMemberSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const team = await addMemberToTeam(teamId, parsed.data.userId);
        return successResponse(team, 201);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id: teamId } = await params;
        const userId = request.nextUrl.searchParams.get("userId");
        if (!userId) {
            return badRequestResponse("userId query parameter is required");
        }

        // Users can remove themselves; admins/team leads can remove anyone
        const actorRole = auth.user.role as unknown as string;
        const isSelf = auth.user.id === userId;
        const isPrivileged =
            actorRole === "ADMIN" ||
            actorRole === "SUPER_ADMIN" ||
            actorRole === "TEAM_LEAD";

        if (!isSelf && !isPrivileged) {
            return badRequestResponse("Insufficient permissions to remove this member");
        }

        const team = await removeMemberFromTeam(teamId, userId);
        return successResponse(team);
    } catch (err) {
        return handleApiError(err);
    }
}
