import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG, absoluteUrl } from "@/config/seo";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: { title: true, description: true, thumbnailUrl: true, status: true },
    });

    if (!campaign) {
        return {
            title: "Campaign Not Found",
            robots: { index: false, follow: false },
        };
    }

    const title = `${campaign.title} — ${SITE_CONFIG.name}`;
    const description = campaign.description
        ? campaign.description.slice(0, 160)
        : `Join this campaign on ${SITE_CONFIG.name} and start deploying.`;
    const image = campaign.thumbnailUrl ?? SITE_CONFIG.ogImage;

    return {
        title: campaign.title,
        description,
        // Dashboard campaign pages are app-only (behind auth) — don't index them
        robots: { index: false, follow: false },
        openGraph: {
            type: "website",
            url: absoluteUrl(`/campaigns/${id}`),
            title,
            description,
            siteName: SITE_CONFIG.name,
            images: [{ url: image, width: 1200, height: 630, alt: campaign.title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}

export default function CampaignDetailLayout({ children }: LayoutProps) {
    return <>{children}</>;
}
