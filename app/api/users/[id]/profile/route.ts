import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getUserProfile } from "@/modules/users/services/userService";
import { successResponse, handleApiError } from "@/lib/utils/api";

// GET /api/users/[id]/profile — All authenticated roles; data is role-scoped in service
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user: authUser, error } = await requireRole(["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (error) return error;
        const { id } = await params;
        const actorRole = authUser.role as unknown as string;
        const profile = await getUserProfile(id, actorRole);
        return successResponse(profile);
    } catch (err) {
        return handleApiError(err);
    }
}
