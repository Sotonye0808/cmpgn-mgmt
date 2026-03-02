import { NextRequest } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { getCampaignAuditLog } from "@/modules/campaign/services/campaignService";
import { handleApiError, parsePagination } from "@/lib/utils/api";
import { NextResponse } from "next/server";

// GET /api/campaigns/[id]/audit — Admin+ only
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (error) return error;

        const { id } = await params;
        const { page, pageSize } = parsePagination(req.nextUrl.searchParams);
        const result = await getCampaignAuditLog(id, page, pageSize);

        return NextResponse.json(result);
    } catch (err) {
        return handleApiError(err);
    }
}
