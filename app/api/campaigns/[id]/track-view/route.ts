import { NextRequest, NextResponse } from "next/server";
import { incrementCampaignView } from "@/modules/links/services/linkService";
import { handleApiError } from "@/lib/utils/api";

// Dedup window: one view count per campaign per visitor per 30 minutes
const VIEW_DEDUP_COOKIE_TTL_SECONDS = 30 * 60;

/**
 * POST /api/campaigns/[id]/track-view
 * Called client-side when a campaign detail page mounts.
 * Increments Campaign.viewCount with a per-visitor dedup window.
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id: campaignId } = await params;
        if (!campaignId) {
            return NextResponse.json({ error: "Missing campaign id" }, { status: 400 });
        }

        const cookieName = `_view_${campaignId}`;
        const alreadySeen = !!_request.cookies.get(cookieName);

        if (!alreadySeen) {
            await incrementCampaignView(campaignId);
        }

        const response = NextResponse.json({ ok: true });
        if (!alreadySeen) {
            response.cookies.set(cookieName, "1", {
                maxAge: VIEW_DEDUP_COOKIE_TTL_SECONDS,
                sameSite: "lax",
                httpOnly: true,
                path: "/",
            });
        }
        return response;
    } catch (err) {
        return handleApiError(err);
    }
}
