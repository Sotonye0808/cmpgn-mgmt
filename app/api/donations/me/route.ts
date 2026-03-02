import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { paginatedResponse, handleApiError } from "@/lib/utils/api";
import { getUserDonations } from "@/modules/donation/services/donationService";
import { parsePagination } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const { page, pageSize } = parsePagination(request.nextUrl.searchParams);
        const donations = await getUserDonations(user.id);
        const total = donations.length;
        const paged = donations.slice((page - 1) * pageSize, page * pageSize);
        return paginatedResponse(paged, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}
