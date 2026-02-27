import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { recordDonation } from "@/modules/donation/services/donationService";
import { createDonationSchema } from "@/lib/schemas/donationSchemas";

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const body = await request.json();
        const parsed = createDonationSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const donation = await recordDonation(user.id, parsed.data);
        return successResponse(donation, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
