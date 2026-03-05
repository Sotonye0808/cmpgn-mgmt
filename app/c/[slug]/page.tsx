import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLinkBySlug } from "@/modules/links/services/linkService";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG, absoluteUrl } from "@/config/seo";
import SmartLinkRedirect from "./_SmartLinkRedirect";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link || !link.isActive) {
    return {
      title: "Invalid Link",
      robots: { index: false, follow: false },
    };
  }

  // Fetch campaign info for richer OG tags
  const campaign = link.campaignId
    ? await prisma.campaign.findUnique({
        where: { id: link.campaignId },
        select: {
          title: true,
          description: true,
          mediaType: true,
          mediaUrl: true,
          thumbnailUrl: true,
          metaImage: true,
          updatedAt: true,
        },
      })
    : null;

  const title = campaign
    ? `${campaign.title} — Join via DMHicc`
    : `Smart Link — ${SITE_CONFIG.name}`;
  const description = campaign?.description
    ? campaign.description.slice(0, 160)
    : `You've been invited to deploy this campaign with ${SITE_CONFIG.name}.`;

  // ── OG image resolution ────────────────────────────────────────────────
  // Priority order (first truthy value wins):
  //   1. campaign.metaImage          — explicit OG override set in the form
  //   2. campaign.thumbnailUrl       — always safe: Cloudinary poster-frame jpg
  //      (for videos this is the frame-at-1s jpg; for images it's the 400px scaled version)
  //   3. campaign.mediaUrl ONLY for image media — raw mediaUrl is an MP4/video
  //      stream for video campaigns; crawlers reject non-image content-types
  //   4. SITE_CONFIG.ogImage         — branded fallback
  //
  // NOTE: We intentionally avoid using mediaUrl when mediaType is VIDEO
  // because Cloudinary serves the file as video/mp4 and no web crawler will
  // render it as an OG image. thumbnailUrl is always the poster-frame JPEG.
  const rawImage =
    campaign?.metaImage ??
    campaign?.thumbnailUrl ??
    (campaign?.mediaType === "IMAGE" ? (campaign?.mediaUrl ?? null) : null) ??
    SITE_CONFIG.ogImage;

  // ── Cloudinary OG crop ────────────────────────────────────────────────
  // Social crawlers (Facebook, Twitter, LinkedIn) require landscape images.
  // Minimum acceptable ratio is 1.91:1 (Facebook); Twitter wants 2:1.
  // We inject a Cloudinary transformation (c_fill,g_auto,w_1200,h_630) into
  // the URL so any portrait/square source image is auto-cropped to the exact
  // 1200×630 landscape format crawlers expect — without touching the original.
  //
  // Only applies to Cloudinary-hosted URLs (contains "res.cloudinary.com").
  // SITE_CONFIG.ogImage should already be sized correctly and is left as-is.
  function toOgImage(url: string): string {
    if (!url.includes("res.cloudinary.com")) return url;
    // Insert transformation segment before the version or named transform
    // e.g. .../upload/v123/file.jpg → .../upload/c_fill,g_auto,w_1200,h_630/v123/file.jpg
    return url.replace(
      /\/upload\//,
      "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/",
    );
  }

  // Append ?v={updatedAt} so social platforms invalidate their cached preview
  // whenever campaign media is updated (cache busting via URL change).
  const versionParam = campaign?.updatedAt
    ? `${rawImage.includes("?") ? "&" : "?"}v=${campaign.updatedAt.getTime()}`
    : "";
  const image = toOgImage(`${rawImage}${versionParam}`);

  return {
    // Smart link slugs should NOT appear in search engine results
    robots: { index: false, follow: false },
    title,
    description,
    openGraph: {
      type: "website",
      url: absoluteUrl(`/c/${slug}`),
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    // Tell CDNs / proxies not to cache this page — so social crawlers
    // that re-scrape a link always read the latest OG tags, not a stale
    // edge-cached version with the old/missing image.
    other: {
      "Cache-Control": "no-store, must-revalidate",
    },
  };
}

export default async function SmartLinkPage({ params }: PageProps) {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link || !link.isActive) {
    redirect("/");
  }

  // Always resolve destination live from the campaign's current ctaUrl so
  // edits to the campaign CTA are reflected immediately for all existing links.
  // Falls back to the stored originalUrl if the campaign has no ctaUrl or is gone.
  let destination = link.originalUrl;
  if (link.campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: link.campaignId },
      select: { ctaUrl: true },
    });
    if (campaign?.ctaUrl) {
      destination = campaign.ctaUrl;
    }
  }

  return <SmartLinkRedirect slug={slug} destination={destination} />;
}
