// ─── Site-wide SEO & Open Graph configuration ────────────────────────────────
// Single source of truth for all metadata constants.
// NEXT_PUBLIC_SITE_URL must be set in .env.local and .env.prod.

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dmhicc.app";

export const SITE_CONFIG = {
    name: "DMHicc",
    fullName: "DMHicc — Digital Mobilization Army",
    tagline: "Digital Mobilization Army",
    description:
        "Join Heaven's Digital Mobilizers. Smart ammunition distribution, referral tracking, military rank progression, and real-time battle analytics.",
    url: SITE_URL,
    /** Absolute URL of the default OG share image (1200×630) */
    ogImage: `${SITE_URL}/og-default.png`,
    twitterHandle: "@dmhicc",
    /** Used as Next.js Metadata title template — "%s | DMHicc" */
    titleTemplate: "%s | DMHicc",
};

/** Build a full absolute URL from a path. */
export function absoluteUrl(path: string): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build an OG images array for Next.js Metadata. */
export function ogImages(
    imageUrl = SITE_CONFIG.ogImage,
    alt = SITE_CONFIG.fullName
) {
    return [{ url: imageUrl, width: 1200, height: 630, alt }];
}
