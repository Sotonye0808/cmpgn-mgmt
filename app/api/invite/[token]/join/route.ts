import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    handleApiError,
} from "@/lib/utils/api";
import { consumeInviteLink } from "@/modules/teams";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { token } = await params;
        const result = await consumeInviteLink(token, auth.user.id);
        return successResponse(result, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
