import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { mockDb } from "@/lib/data/mockDb";
import { z } from "zod";

const reviewSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().optional(),
});

// PUT — review (approve/reject) a view proof
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id: proofId } = await params;
        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const now = new Date().toISOString();
        const updated = mockDb.viewProofs.update({
            where: { id: proofId },
            data: {
                status: parsed.data.status as unknown as ViewProofStatus,
                reviewedById: auth.user.id,
                reviewedAt: now,
                notes: parsed.data.notes,
                updatedAt: now,
            },
        });

        if (!updated) {
            return notFoundResponse("View proof not found");
        }

        mockDb.emit("viewProofs:changed");
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
