import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError, successResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serializeArray } from "@/lib/utils/serialize";

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const notifications = await prisma.appNotification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return successResponse(serializeArray(notifications));
    } catch (err) {
        return handleApiError(err);
    }
}
