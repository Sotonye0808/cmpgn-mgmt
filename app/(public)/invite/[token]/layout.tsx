import type { Metadata } from "next";
import { SITE_CONFIG, absoluteUrl } from "@/config/seo";
import { prisma } from "@/lib/prisma";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
    const { token } = await params;

    const invite = await prisma.teamInviteLink.findUnique({
        where: { token },
        include: {
            team: {
                include: { group: { select: { name: true } } },
            },
        },
    });

    if (!invite || !invite.isActive) {
        return {
            title: "Invalid Invite Link",
            robots: { index: false, follow: false },
        };
    }

    const roleName = invite.targetRole === "TEAM_LEAD" ? "Team Lead" : "Member";
    const groupPart = invite.team.group?.name ? ` · ${invite.team.group.name}` : "";
    const title = `Join ${invite.team.name}${groupPart} as ${roleName} — ${SITE_CONFIG.name}`;
    const description = `You've been invited to join ${invite.team.name} on ${SITE_CONFIG.name}. Click to accept and start deploying with your team.`;

    return {
        title: `Join ${invite.team.name}`,
        description,
        // Invite links should never be indexed — they expire and are single-use
        robots: { index: false, follow: false },
        openGraph: {
            type: "website",
            url: absoluteUrl(`/invite/${token}`),
            title,
            description,
            siteName: SITE_CONFIG.name,
            images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary",
            title,
            description,
            images: [SITE_CONFIG.ogImage],
        },
    };
}

export default function InviteLayout({ children }: LayoutProps) {
    return <>{children}</>;
}
