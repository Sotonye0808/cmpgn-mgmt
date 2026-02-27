import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { reviewFlag } from "@/modules/trust/services/trustService";
import { z } from "zod";

const reviewSchema = z.object({
    resolution: z.enum(["CLEAR", "PENALIZE", "ESCALATE"]),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;
        const admin = auth.user;

        const { id: userId } = await params;
        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const updated = await reviewFlag(userId, parsed.data.resolution, admin.id);
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
