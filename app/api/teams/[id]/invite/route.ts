import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { generateInviteLink } from "@/modules/teams";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteSchema = z.object({
    targetRole: z.enum(["MEMBER", "TEAM_LEAD"]),
    maxUses: z.number().int().min(1).max(100).optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Users can invite to their own team as MEMBER; admins can invite to any team with any role
        const auth = await requireRole(["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id: teamId } = await params;
        const body = await request.json();
        const parsed = inviteSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const actorRole = auth.user.role as string;

        // Regular users can only create MEMBER invites for their own team
        if (actorRole === "USER") {
            const user = await prisma.user.findUnique({
                where: { id: auth.user.id },
                select: { teamId: true },
            });
            if (!user?.teamId || user.teamId !== teamId) {
                return badRequestResponse("You can only create invites for your own team");
            }
            if (parsed.data.targetRole === "TEAM_LEAD") {
                return badRequestResponse("Only admins can create team lead invites");
            }
        }

        // Team leads can create MEMBER invites for their own team
        if (actorRole === "TEAM_LEAD") {
            const user = await prisma.user.findUnique({
                where: { id: auth.user.id },
                select: { teamId: true },
            });
            if (!user?.teamId || user.teamId !== teamId) {
                return badRequestResponse("You can only create invites for your own team");
            }
        }

        // Admins can invite to any team with any role — no additional checks

        const invite = await generateInviteLink({
            teamId,
            createdById: auth.user.id,
            targetRole: parsed.data.targetRole,
            maxUses: parsed.data.maxUses,
        });
        return successResponse(invite, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
