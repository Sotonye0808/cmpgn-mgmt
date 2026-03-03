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
import { z } from "zod";

const batchVerifySchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
    action: z.enum(["VERIFIED", "REJECTED"]),
    notes: z.string().max(500).optional(),
});

// PATCH — batch verify/reject multiple donations at once
export async function PATCH(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const body = await request.json();
        const parsed = batchVerifySchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const { ids, action, notes } = parsed.data;

        // Fetch donations that are in a verifiable state (PENDING or RECEIVED)
        const donations = await prisma.donation.findMany({
            where: {
                id: { in: ids },
                status: { in: ["PENDING", "RECEIVED"] as never[] },
            },
        });

        if (donations.length === 0) {
            return badRequestResponse("No pending/received donations found for the given IDs");
        }

        const donationIds = donations.map((d) => d.id);

        // Batch update status
        const updated = await prisma.donation.updateMany({
            where: { id: { in: donationIds } },
            data: {
                status: action as never,
                verifiedById: auth.user.id,
                verifiedAt: new Date(),
                notes,
            },
        });

        // If verified, update campaign goal amounts
        if (action === "VERIFIED") {
            // Group donations by campaign for efficient updates
            const byCampaign = new Map<string, number>();
            for (const d of donations) {
                const amount = typeof d.amount === "object"
                    ? (d.amount as unknown as { toNumber(): number }).toNumber()
                    : Number(d.amount);
                const current = byCampaign.get(d.campaignId) ?? 0;
                byCampaign.set(d.campaignId, current + amount);
            }

            await Promise.all(
                Array.from(byCampaign.entries()).map(([campaignId, totalAmount]) =>
                    prisma.campaign.update({
                        where: { id: campaignId },
                        data: { goalCurrent: { increment: totalAmount } },
                    })
                ),
            );
        }

        await redis.invalidatePattern("donations:");

        // Return updated donations
        const result = await prisma.donation.findMany({
            where: { id: { in: donationIds } },
        });

        return successResponse({
            updated: updated.count,
            skipped: ids.length - donations.length,
            donations: serializeArray(result),
        });
    } catch (err) {
        return handleApiError(err);
    }
}
