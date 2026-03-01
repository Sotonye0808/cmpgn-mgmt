import { NextRequest, NextResponse } from "next/server";
import { getLinkBySlug, incrementClick, logLinkEvent } from "@/modules/links/services/linkService";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { slug } = await params;

    try {
        const link = await getLinkBySlug(slug);
        if (!link || !link.isActive) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        const cookieName = `_uid_${slug}`;
        const cookieSeen = !!request.cookies.get(cookieName);
        const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
        const userAgent = request.headers.get("user-agent") ?? undefined;

        // Increment click counter (with dedup)
        await incrementClick({ slug, ipAddress, userAgent, cookieSeen });

        // Log the event
        await logLinkEvent({
            linkId: link.id,
            type: "CLICK" as unknown as LinkEventType,
            ipAddress,
            userAgent,
            referrer: request.headers.get("referer") ?? undefined,
        });

        // Redirect to original URL and stamp dedup cookie (24 h)
        const response = NextResponse.redirect(new URL(link.originalUrl));
        if (!cookieSeen) {
            response.cookies.set(cookieName, "1", {
                maxAge: 86400,
                sameSite: "lax",
                httpOnly: true,
            });
        }
        return response;
    } catch {
        // Fallback redirect on any error
        return NextResponse.redirect(new URL("/", request.url));
    }
}
