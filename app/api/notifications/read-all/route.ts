import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError, successResponse } from "@/lib/utils/api";
import { mockDb } from "@/lib/data/mockDb";

export async function POST() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const unread = mockDb.notifications.findMany({
            where: { userId: user.id, isRead: false },
        });

        for (const n of unread) {
            mockDb.notifications.update({ where: { id: n.id }, data: { isRead: true } });
        }

        mockDb.emit("notifications:changed");
        return successResponse({ markedRead: unread.length });
    } catch (err) {
        return handleApiError(err);
    }
}
