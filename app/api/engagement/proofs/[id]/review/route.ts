import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize } from "@/lib/utils/serialize";
import { award } from "@/modules/points/services/pointsService";
import { z } from "zod";

const reviewSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().optional(),
});

// PATCH — review (approve/reject) a view proof
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
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

        // Award RELIABILITY points on approval
        if (parsed.data.status === "APPROVED") {
            await award(existing.userId, "PROOF_APPROVED", existing.campaignId, proofId);
        }

        await redis.invalidatePattern("proofs:");
        return successResponse(serialize(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
