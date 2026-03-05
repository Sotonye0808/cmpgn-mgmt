import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLinkBySlug } from "@/modules/links/services/linkService";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG, absoluteUrl } from "@/config/seo";
import SmartLinkRedirect from "./_SmartLinkRedirect";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
              select: { title: true, description: true, mediaType: true, mediaUrl: true, thumbnailUrl: true, metaImage: true, updatedAt: true },
          })
        : null;

    const title = campaign
        ? `${campaign.title} — Join via DMHicc`
        : `Smart Link — ${SITE_CONFIG.name}`;
    const description = campaign?.description
        ? campaign.description.slice(0, 160)
        : `You've been invited to deploy this campaign with ${SITE_CONFIG.name}.`;
    // Priority: explicit metaImage → IMAGE mediaUrl → thumbnailUrl → default OG
    // Append ?v={updatedAt} so social platforms re-fetch the image when campaign
    // media is updated (crawlers cache OG images keyed to URL; a new URL busts the cache).
    const rawImage =
        campaign?.metaImage ??
        (campaign?.mediaType === "IMAGE" && campaign?.mediaUrl ? campaign.mediaUrl : null) ??
        campaign?.thumbnailUrl ??
        SITE_CONFIG.ogImage;
    const versionParam = campaign?.updatedAt
        ? `${rawImage.includes("?") ? "&" : "?"}v=${campaign.updatedAt.getTime()}`
        : "";
    const image = `${rawImage}${versionParam}`;

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
