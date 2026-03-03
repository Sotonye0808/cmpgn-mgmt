import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serializeArray } from "@/lib/utils/serialize";
import { award } from "@/modules/points/services/pointsService";
import { z } from "zod";

const batchReviewSchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().optional(),
});

// PATCH — batch review (approve/reject) multiple view proofs at once
export async function PATCH(request: NextRequest) {
    try {
        const auth = await requireRole(["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const body = await request.json();
        const parsed = batchReviewSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const { ids, status, notes } = parsed.data;

        // Fetch all proofs to validate they exist and are PENDING
        const proofs = await prisma.viewProof.findMany({
            where: { id: { in: ids }, status: "PENDING" as never },
        });

        if (proofs.length === 0) {
            return badRequestResponse("No pending proofs found for the given IDs");
        }

        // Batch update all matching proofs
        const updated = await prisma.viewProof.updateMany({
            where: { id: { in: proofs.map((p) => p.id) } },
            data: {
                status: status as never,
                reviewedById: auth.user.id,
                reviewedAt: new Date(),
                notes,
            },
        });

        // Award points for each approved proof
        if (status === "APPROVED") {
            await Promise.all(
                proofs.map((p) =>
                    award(p.userId, "PROOF_APPROVED", p.campaignId, p.id)
                ),
            );
        }

        await redis.invalidatePattern("proofs:");

        // Return the updated proofs
        const result = await prisma.viewProof.findMany({
            where: { id: { in: proofs.map((p) => p.id) } },
        });

        return successResponse({
            updated: updated.count,
            skipped: ids.length - proofs.length,
            proofs: serializeArray(result),
        });
    } catch (err) {
        return handleApiError(err);
    }
}
