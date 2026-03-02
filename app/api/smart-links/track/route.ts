import { NextRequest, NextResponse } from "next/server";
import { incrementClick, logLinkEvent, getLinkBySlug } from "@/modules/links/services/linkService";
import { handleApiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({
    slug: z.string().min(1),
    referrer: z.string().optional(),
});

/**
 * POST /api/smart-links/track
 * Called client-side from the smart link redirect page after JS loads.
 * Handles cookie-based dedup, click counting, point crediting, and event logging.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { slug, referrer } = parsed.data;
        const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
        const userAgent = request.headers.get("user-agent") ?? undefined;

        // Cookie-based dedup — same logic as the old route handler
        const cookieName = `_uid_${slug}`;
        const cookieSeen = !!request.cookies.get(cookieName);

        const link = await getLinkBySlug(slug);
        if (!link || !link.isActive) {
            return NextResponse.json({ ok: false }, { status: 404 });
        }

        // Increment click (handles dedup via Redis fingerprint + cookie flag)
        await incrementClick({ slug, ipAddress, userAgent, cookieSeen });

        // Log the event
        await logLinkEvent({
            linkId: link.id,
            type: "CLICK" as unknown as LinkEventType,
            ipAddress,
            userAgent,
            referrer: referrer || undefined,
        });

        // Stamp dedup cookie on the response (24h)
        const response = NextResponse.json({ ok: true });
        if (!cookieSeen) {
            response.cookies.set(cookieName, "1", {
                maxAge: 86400,
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
