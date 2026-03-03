import { NextRequest } from "next/server";
import { requireRole, requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { listTeams, createTeam } from "@/modules/teams";
import { z } from "zod";

const createTeamSchema = z.object({
    name: z.string().min(2).max(100),
    groupId: z.string().min(1),
    teamLeadId: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const groupId = request.nextUrl.searchParams.get("groupId") ?? undefined;
        const teams = await listTeams(groupId);
        return successResponse(teams);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const body = await request.json();
        const parsed = createTeamSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const team = await createTeam(parsed.data);
        return successResponse(team, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
