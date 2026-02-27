import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/auth";
import { refreshSnapshot } from "@/modules/leaderboard/services/leaderboardService";
import { handleApiError } from "@/lib/utils/api";
import { z } from "zod";

const bodySchema = z.object({
    campaignId: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (auth.error) return auth.error;

    try {
        const body = await req.json().catch(() => ({}));
        const { campaignId } = bodySchema.parse(body);
        await refreshSnapshot(campaignId);
        return NextResponse.json({ success: true, message: "Snapshot refreshed." });
    } catch (err) {
        return handleApiError(err);
    }
}
