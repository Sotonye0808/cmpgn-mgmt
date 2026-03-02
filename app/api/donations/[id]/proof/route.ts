import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { uploadDonationProof } from "@/modules/donation/services/donationService";
import { uploadProofSchema } from "@/lib/schemas/donationSchemas";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const parsed = uploadProofSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const donation = await uploadDonationProof(
            id,
            parsed.data.proofScreenshotUrl
        );
        return successResponse(donation);
    } catch (err) {
        return handleApiError(err);
    }
}
