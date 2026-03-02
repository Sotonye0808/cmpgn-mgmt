import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { setTeamLead } from "@/modules/teams";
import { z } from "zod";

const setLeadSchema = z.object({
    userId: z.string().min(1),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id: teamId } = await params;
        const body = await request.json();
        const parsed = setLeadSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const team = await setTeamLead(teamId, parsed.data.userId);
        return successResponse(team);
    } catch (err) {
        return handleApiError(err);
    }
}
