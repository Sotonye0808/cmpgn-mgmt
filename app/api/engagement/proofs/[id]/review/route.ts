import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";
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

        const existing = await prisma.viewProof.findUnique({ where: { id: proofId } });
        if (!existing) {
            return notFoundResponse("View proof not found");
        }

        const updated = await prisma.viewProof.update({
            where: { id: proofId },
            data: {
                status: parsed.data.status as never,
                reviewedById: auth.user.id,
                reviewedAt: new Date(),
                notes: parsed.data.notes,
            },
        });

        return successResponse(serialize(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
