import { NextRequest } from "next/server";
import { successResponse, notFoundResponse, handleApiError } from "@/lib/utils/api";
import { requireAuth } from "@/lib/middleware/auth";
import { mockDb } from "@/lib/data/mockDb";
import { deactivateLink } from "@/modules/links/services/linkService";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const link = await mockDb.smartLinks.findUnique({ where: { id } });
        if (!link) return notFoundResponse("Smart link not found");
        return successResponse(link);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const { id } = await params;
        const link = await mockDb.smartLinks.findUnique({ where: { id } });
        if (!link) return notFoundResponse("Smart link not found");

        // Owner or admin can deactivate
        const isAdmin = (user.role as string) === "ADMIN" || (user.role as string) === "SUPER_ADMIN";
        if (!isAdmin && link.userId !== user.id) {
            const { forbiddenResponse } = await import("@/lib/utils/api");
            return forbiddenResponse();
        }

        const updated = await deactivateLink(id);
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
