import { requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { getFlaggedUsers } from "@/modules/trust/services/trustService";

export async function GET() {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const users = await getFlaggedUsers();
        return successResponse(users);
    } catch (err) {
        return handleApiError(err);
    }
}
