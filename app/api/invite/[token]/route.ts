import { NextRequest } from "next/server";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { getInviteLink } from "@/modules/teams";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // Public endpoint — no auth required (invite preview)
        const { token } = await params;
        const invite = await getInviteLink(token);
        if (!invite) return notFoundResponse("Invalid or expired invite link");

        // Fetch team and group info for the invite preview
        const team = await prisma.team.findUnique({
            where: { id: invite.teamId },
            include: { group: true, members: { select: { id: true } } },
        });
        if (!team) return notFoundResponse("Team not found");

        // Don't expose full invite details to public — just what's needed for the join page
        return successResponse({
            token: invite.token,
            teamName: team.name,
            teamMemberCount: team.members.length,
            teamMaxMembers: team.maxMembers,
            groupName: team.group?.name ?? null,
            targetRole: invite.targetRole,
            isActive: invite.isActive,
            isExpired: invite.expiresAt
                ? new Date(invite.expiresAt) < new Date()
                : false,
            isFull: invite.usedCount >= invite.maxUses,
        });
    } catch (err) {
        return handleApiError(err);
    }
}
