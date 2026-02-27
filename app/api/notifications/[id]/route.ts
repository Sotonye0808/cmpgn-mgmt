import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    handleApiError,
    notFoundResponse,
    successResponse,
    forbiddenResponse,
} from "@/lib/utils/api";
import { mockDb } from "@/lib/data/mockDb";

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const { id } = await params;
        const notification = mockDb.notifications.findUnique({ where: { id } });
        if (!notification) return notFoundResponse("Notification not found");
        if (notification.userId !== user.id) return forbiddenResponse();

        const updated = mockDb.notifications.update({
            where: { id },
            data: { isRead: true },
        });

        mockDb.emit("notifications:changed");
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
