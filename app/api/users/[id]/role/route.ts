import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { changeUserRole } from "@/modules/users/services/userService";
import { z } from "zod";

const roleSchema = z.object({
    role: z.enum(["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id: userId } = await params;
        const body = await request.json();
        const parsed = roleSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        // Forward actor identity for privilege ceiling enforcement
        const updated = await changeUserRole(
            userId,
            parsed.data.role,
            auth.user.id,
            auth.user.role as unknown as string
        );
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
