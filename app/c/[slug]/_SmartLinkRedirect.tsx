"use client";

import { useEffect } from "react";

interface Props {
    slug: string;
    destination: string;
}

/**
 * Immediately redirects users to the destination URL.
 * Also fires a server-side click-tracking call before navigating.
 * Bots will never execute this component — they read the OG tags
 * from the server-rendered HTML that wraps this component.
 */
export default function SmartLinkRedirect({ slug, destination }: Props) {
    useEffect(() => {
        // Fire-and-forget tracking — do not await, redirect immediately
        fetch("/api/smart-links/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, referrer: document.referrer }),
            keepalive: true, // ensure the request survives navigation
        }).catch(() => {
            /* best-effort */
        });

        window.location.href = destination;
    }, [slug, destination]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-ds-surface-base">
            <div className="flex flex-col items-center gap-4 text-center px-6">
                {/* No spinner lib dependency — pure CSS animation */}
                <div className="w-10 h-10 rounded-full border-4 border-ds-brand-accent border-t-transparent animate-spin" />
                <p className="text-ds-text-secondary text-sm">Redirecting…</p>
                {/* Progressive fallback for no-JS environments */}
                <noscript>
                    <p className="text-ds-text-secondary text-sm">
                        JavaScript is required.{" "}
                        <a
                            href={destination}
                            className="text-ds-brand-accent underline">
                            Click here to continue.
                        </a>
                    </p>
                </noscript>
            </div>
        </div>
    );
}
