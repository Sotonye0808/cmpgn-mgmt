import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError, successResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const result = await prisma.appNotification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true },
        });

        return successResponse({ markedRead: result.count });
    } catch (err) {
        return handleApiError(err);
    }
}
