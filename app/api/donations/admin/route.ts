import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { paginatedResponse, handleApiError } from "@/lib/utils/api";
import { parsePagination } from "@/lib/utils/api";
import { listDonations } from "@/modules/donation/services/donationService";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const params = request.nextUrl.searchParams;
        const { page, pageSize } = parsePagination(params);
        const status = params.get("status") ?? undefined;
        const campaignId = params.get("campaignId") ?? undefined;
        const search = params.get("search") ?? undefined;

        const { data, total } = await listDonations(page, pageSize, {
            status,
            campaignId,
            search,
        });

        return paginatedResponse(data, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}
