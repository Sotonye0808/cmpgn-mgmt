import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { listUsers } from "@/modules/users/services/userService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const search = request.nextUrl.searchParams.get("search") ?? "";
        const role = request.nextUrl.searchParams.get("role") ?? undefined;

        const users = await listUsers(search, role);
        return successResponse(users);
    } catch (err) {
        return handleApiError(err);
    }
}
