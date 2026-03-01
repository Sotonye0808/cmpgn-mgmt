import { NextRequest } from "next/server";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { getInviteLink } from "@/modules/teams";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // Public endpoint — no auth required (invite preview)
        const { token } = await params;
        const data = await getInviteLink(token);
        if (!data) return notFoundResponse("Invalid or expired invite link");

        const { invite, team, group } = data;

        // Don't expose full invite details to public — just what's needed for the join page
        return successResponse({
            token: invite.token,
            teamName: team.name,
            teamMemberCount: team.memberIds.length,
            teamMaxMembers: team.maxMembers,
            groupName: group?.name ?? null,
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
