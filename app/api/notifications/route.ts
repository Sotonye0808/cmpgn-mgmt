import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError, successResponse } from "@/lib/utils/api";
import { mockDb } from "@/lib/data/mockDb";

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const notifications = mockDb.notifications
            .findMany({ where: { userId: user.id } })
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

        return successResponse(notifications);
    } catch (err) {
        return handleApiError(err);
    }
}
