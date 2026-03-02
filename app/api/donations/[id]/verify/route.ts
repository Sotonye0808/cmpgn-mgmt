import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { verifyDonation } from "@/modules/donation/services/donationService";
import { verifyDonationSchema } from "@/lib/schemas/donationSchemas";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const parsed = verifyDonationSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const donation = await verifyDonation(
            id,
            parsed.data.action as DonationStatus,
            auth.user.id,
            parsed.data.notes
        );
        return successResponse(donation);
    } catch (err) {
        return handleApiError(err);
    }
}
