import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    handleApiError,
    notFoundResponse,
    successResponse,
    forbiddenResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const { id } = await params;
        const notification = await prisma.appNotification.findUnique({ where: { id } });
        if (!notification) return notFoundResponse("Notification not found");
        if (notification.userId !== user.id) return forbiddenResponse();

        const updated = await prisma.appNotification.update({
            where: { id },
            data: { isRead: true },
        });

        return successResponse(serialize(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
