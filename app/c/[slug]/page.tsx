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
              select: { title: true, description: true, thumbnailUrl: true },
          })
        : null;

    const title = campaign
        ? `${campaign.title} — Join via DMHicc`
        : `Smart Link — ${SITE_CONFIG.name}`;
    const description = campaign?.description
        ? campaign.description.slice(0, 160)
        : `You've been invited to deploy this campaign with ${SITE_CONFIG.name}.`;
    const image = campaign?.thumbnailUrl ?? SITE_CONFIG.ogImage;

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

    return <SmartLinkRedirect slug={slug} destination={link.originalUrl} />;
}
