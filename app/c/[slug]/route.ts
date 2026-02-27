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

        // Increment click counter
        await incrementClick({ slug });

        // Log the event
        await logLinkEvent({
            linkId: link.id,
            type: "CLICK" as unknown as LinkEventType,
            ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
            userAgent: request.headers.get("user-agent") ?? undefined,
            referrer: request.headers.get("referer") ?? undefined,
        });

        // Redirect to original URL
        return NextResponse.redirect(new URL(link.originalUrl));
    } catch {
        // Fallback redirect on any error
        return NextResponse.redirect(new URL("/", request.url));
    }
}
