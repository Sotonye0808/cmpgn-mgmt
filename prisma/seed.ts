import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BCRYPT_SALT_ROUNDS = 12;
const HASH = bcrypt.hashSync("Password123!", BCRYPT_SALT_ROUNDS);

function d(offsetDays: number): Date {
    const date = new Date("2026-01-15T09:00:00.000Z");
    date.setDate(date.getDate() + offsetDays);
    return date;
}

// ─── Main Seed ───────────────────────────────────────────────────────────────

async function main() {
    console.log("🌱 Seeding database…");

    // Clear all tables in dependency order
    await prisma.$transaction([
        prisma.campaignAuditEvent.deleteMany(),
        prisma.teamInviteLink.deleteMany(),
        prisma.viewProof.deleteMany(),
        prisma.appNotification.deleteMany(),
        prisma.leaderboardSnapshot.deleteMany(),
        prisma.pointsLedgerEntry.deleteMany(),
        prisma.donation.deleteMany(),
        prisma.referral.deleteMany(),
        prisma.linkEvent.deleteMany(),
        prisma.smartLink.deleteMany(),
        prisma.campaignParticipation.deleteMany(),
        prisma.trustScore.deleteMany(),
        prisma.campaign.deleteMany(),
        prisma.user.deleteMany(),
        prisma.team.deleteMany(),
        prisma.group.deleteMany(),
    ]);

    console.log("  ✓ Cleared existing data");

    // ─── Groups ──────────────────────────────────────────────────────────────

    await prisma.group.createMany({
        data: [
            {
                id: "group-1",
                name: "Alpha Division",
                description: "Primary digital mobilization division — highest performing teams.",
                maxTeams: 4,
                createdAt: d(-55),
            },
            {
                id: "group-2",
                name: "Omega Division",
                description: "Second wave mobilization force — social media specialists.",
                maxTeams: 4,
                createdAt: d(-50),
            },
        ],
    });
    console.log("  ✓ Groups");

    // ─── Teams ───────────────────────────────────────────────────────────────

    await prisma.team.createMany({
        data: [
            { id: "team-1", name: "WhatsApp Warriors", groupId: "group-1", teamLeadId: "user-lead-1", maxMembers: 10, createdAt: d(-50) },
            { id: "team-2", name: "Instagram Squad", groupId: "group-1", maxMembers: 10, createdAt: d(-45) },
            { id: "team-3", name: "TikTok Vanguard", groupId: "group-2", maxMembers: 10, createdAt: d(-40) },
            { id: "team-4", name: "Twitter Blitz", groupId: "group-2", maxMembers: 10, createdAt: d(-35) },
        ],
    });
    console.log("  ✓ Teams");

    // ─── Users ───────────────────────────────────────────────────────────────

    await prisma.user.createMany({
        data: [
            {
                id: "user-super-1",
                email: "super@dmhicc.org",
                passwordHash: HASH,
                firstName: "Chidi",
                lastName: "Okonkwo",
                role: "SUPER_ADMIN",
                profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Chidi",
                trustScore: 100,
                isActive: true,
                createdAt: d(-60),
            },
            {
                id: "user-admin-1",
                email: "admin@dmhicc.org",
                passwordHash: HASH,
                firstName: "Ngozi",
                lastName: "Adeyemi",
                role: "ADMIN",
                profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ngozi",
                trustScore: 98,
                isActive: true,
                createdAt: d(-55),
            },
            {
                id: "user-lead-1",
                email: "lead@dmhicc.org",
                passwordHash: HASH,
                firstName: "Emeka",
                lastName: "Nwosu",
                role: "TEAM_LEAD",
                profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Emeka",
                trustScore: 95,
                whatsappNumber: "+2348031234567",
                teamId: "team-1",
                isActive: true,
                createdAt: d(-50),
            },
            {
                id: "user-1",
                email: "user@dmhicc.org",
                passwordHash: HASH,
                firstName: "Adaeze",
                lastName: "Okafor",
                role: "USER",
                profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Adaeze",
                trustScore: 87,
                whatsappNumber: "+2347098765432",
                teamId: "team-1",
                isActive: true,
                weaponsOfChoice: ["FACEBOOK", "WHATSAPP", "INSTAGRAM"],
                createdAt: d(-45),
            },
            {
                id: "user-2",
                email: "tunde@dmhicc.org",
                passwordHash: HASH,
                firstName: "Tunde",
                lastName: "Babatunde",
                role: "USER",
                profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Tunde",
                trustScore: 72,
                teamId: "team-1",
                isActive: true,
                weaponsOfChoice: ["TWITTER_X", "TIKTOK"],
                createdAt: d(-40),
            },
        ],
    });
    console.log("  ✓ Users");

    // ─── Campaigns ───────────────────────────────────────────────────────────

    await prisma.campaign.createMany({
        data: [
            {
                id: "camp-1",
                title: "Easter Harvest Drive 2026",
                description: "Mobilize your network to join the Easter Sunday celebration and harvest.",
                content: "Share this campaign with friends, family, and colleagues. Invite them to the Easter service.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/camp1/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp1/400/200",
                ctaText: "Join the Harvest",
                ctaUrl: "https://harvesters.org/easter",
                createdById: "user-admin-1",
                status: "ACTIVE",
                goalType: "REFERRALS",
                goalTarget: 1000,
                goalCurrent: 347,
                startDate: d(-10),
                endDate: d(20),
                targetAudience: ["Youth", "Young Adults"],
                publishedAt: d(-10),
                viewCount: 4823,
                clickCount: 2140,
                shareCount: 891,
                likeCount: 612,
                participantCount: 347,
                createdAt: d(-12),
            },
            {
                id: "camp-2",
                title: "Digital Outreach January",
                description: "Kick off the year with a digital outreach blitz across all channels.",
                content: "Share the gospel message across your digital networks. Every click counts.",
                mediaType: "VIDEO",
                mediaUrl: "https://picsum.photos/seed/camp2/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp2/400/200",
                ctaText: "Share Now",
                ctaUrl: "https://harvesters.org/outreach",
                createdById: "user-admin-1",
                status: "ACTIVE",
                goalType: "SHARES",
                goalTarget: 5000,
                goalCurrent: 1823,
                startDate: d(-20),
                endDate: d(10),
                targetAudience: ["All Members"],
                publishedAt: d(-20),
                viewCount: 9210,
                clickCount: 4823,
                shareCount: 1823,
                likeCount: 1204,
                participantCount: 892,
                createdAt: d(-22),
            },
            {
                id: "camp-3",
                title: "Community Giving Initiative",
                description: "Raise funds to support community development projects.",
                content: "Every donation makes a difference in someone's life.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/camp3/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp3/400/200",
                ctaText: "Donate Now",
                ctaUrl: "https://harvesters.org/give",
                createdById: "user-admin-1",
                status: "ACTIVE",
                goalType: "DONATIONS",
                goalTarget: 500000,
                goalCurrent: 187350,
                startDate: d(-15),
                endDate: d(15),
                targetAudience: ["All Members", "Donors"],
                publishedAt: d(-15),
                viewCount: 3891,
                clickCount: 2103,
                shareCount: 743,
                likeCount: 891,
                participantCount: 534,
                createdAt: d(-17),
            },
            {
                id: "camp-4",
                title: "Youth Ignite Conference",
                description: "Get young people excited about the upcoming Youth Ignite Conference.",
                content: "Share the conference details widely. Free entry for first-time attendees.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/camp4/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp4/400/200",
                ctaText: "Register Now",
                ctaUrl: "https://harvesters.org/ignite",
                createdById: "user-lead-1",
                status: "ACTIVE",
                goalType: "PARTICIPANTS",
                goalTarget: 2000,
                goalCurrent: 812,
                startDate: d(-5),
                endDate: d(25),
                targetAudience: ["Youth", "Teenagers"],
                publishedAt: d(-5),
                viewCount: 5623,
                clickCount: 3401,
                shareCount: 1203,
                likeCount: 2341,
                participantCount: 812,
                createdAt: d(-7),
            },
            {
                id: "camp-5",
                title: "Prayer Chain 2026",
                description: "A global prayer chain connecting members across all campuses.",
                content: "Join the prayer chain and receive daily prayer prompts.",
                mediaType: "TEXT",
                createdById: "user-super-1",
                status: "PAUSED",
                goalType: "PARTICIPANTS",
                goalTarget: 10000,
                goalCurrent: 3421,
                startDate: d(-30),
                endDate: d(60),
                viewCount: 12043,
                clickCount: 7823,
                shareCount: 3421,
                likeCount: 4201,
                participantCount: 3421,
                createdAt: d(-35),
            },
            {
                id: "camp-6",
                title: "New Members Onboarding Drive",
                description: "Help new members feel welcome and connected.",
                content: "Share the new members welcome pack with anyone who recently joined.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/camp6/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp6/400/200",
                ctaText: "Welcome Pack",
                ctaUrl: "https://harvesters.org/welcome",
                createdById: "user-admin-1",
                status: "COMPLETED",
                goalType: "SHARES",
                goalTarget: 1000,
                goalCurrent: 1124,
                startDate: d(-60),
                endDate: d(-5),
                publishedAt: d(-60),
                viewCount: 8901,
                clickCount: 5612,
                shareCount: 1124,
                likeCount: 943,
                participantCount: 634,
                createdAt: d(-62),
            },
            {
                id: "camp-7",
                title: "Christmas Outreach Planning",
                description: "Plan and coordinate the Christmas outreach campaign for December.",
                content: "Draft campaign — details coming soon.",
                mediaType: "TEXT",
                createdById: "user-admin-1",
                status: "DRAFT",
                goalType: "SHARES",
                goalTarget: 10000,
                goalCurrent: 0,
                viewCount: 0,
                clickCount: 0,
                shareCount: 0,
                likeCount: 0,
                participantCount: 0,
                createdAt: d(-2),
            },
            {
                id: "camp-8",
                title: "Mid-Year Thanksgiving Drive",
                description: "Celebrate God's faithfulness in the first half of the year.",
                content: "Share testimonies and invite others to the thanksgiving service.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/camp8/800/400",
                thumbnailUrl: "https://picsum.photos/seed/camp8/400/200",
                ctaText: "RSVP Now",
                ctaUrl: "https://harvesters.org/thanksgiving",
                createdById: "user-admin-1",
                status: "ARCHIVED",
                goalType: "PARTICIPANTS",
                goalTarget: 3000,
                goalCurrent: 2891,
                startDate: d(-120),
                endDate: d(-90),
                publishedAt: d(-120),
                viewCount: 18234,
                clickCount: 9821,
                shareCount: 3201,
                likeCount: 5123,
                participantCount: 2891,
                createdAt: d(-125),
            },
            // ─── Mega Campaign
            {
                id: "camp-mega-1",
                title: "Operation Harvest 2026",
                description: "The flagship mega mission combining outreach, giving, and digital mobilization into one unified operation.",
                content: "Operation Harvest 2026 is the year's biggest campaign. Multiple sub-missions feed into this mega operation.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/mega1/800/400",
                thumbnailUrl: "https://picsum.photos/seed/mega1/400/200",
                ctaText: "Join the Operation",
                ctaUrl: "https://harvesters.org/harvest2026",
                createdById: "user-super-1",
                status: "ACTIVE",
                goalType: "PARTICIPANTS",
                goalTarget: 25000,
                goalCurrent: 5230,
                startDate: d(-30),
                endDate: d(90),
                targetAudience: ["All Members"],
                publishedAt: d(-30),
                viewCount: 32000,
                clickCount: 18500,
                shareCount: 7200,
                likeCount: 9100,
                participantCount: 5230,
                isMegaCampaign: true,
                createdAt: d(-35),
            },
            {
                id: "camp-sub-1",
                title: "Operation Harvest — Digital Blitz",
                description: "The digital outreach arm of Operation Harvest 2026.",
                content: "Share the harvest message digitally. Use your ammunition on every platform you have access to.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/sub1/800/400",
                thumbnailUrl: "https://picsum.photos/seed/sub1/400/200",
                ctaText: "Deploy Now",
                ctaUrl: "https://harvesters.org/harvest2026/digital",
                createdById: "user-admin-1",
                status: "ACTIVE",
                goalType: "SHARES",
                goalTarget: 10000,
                goalCurrent: 3100,
                startDate: d(-25),
                endDate: d(90),
                targetAudience: ["Youth", "Young Adults", "All Members"],
                publishedAt: d(-25),
                viewCount: 14200,
                clickCount: 8300,
                shareCount: 3100,
                likeCount: 4200,
                participantCount: 2100,
                parentCampaignId: "camp-mega-1",
                createdAt: d(-27),
            },
            {
                id: "camp-sub-2",
                title: "Operation Harvest — Giving Initiative",
                description: "The fundraising arm of Operation Harvest 2026.",
                content: "Support the harvest with your giving. All donations go directly to community outreach projects.",
                mediaType: "IMAGE",
                mediaUrl: "https://picsum.photos/seed/sub2/800/400",
                thumbnailUrl: "https://picsum.photos/seed/sub2/400/200",
                ctaText: "Give Now",
                ctaUrl: "https://harvesters.org/harvest2026/give",
                createdById: "user-admin-1",
                status: "ACTIVE",
                goalType: "DONATIONS",
                goalTarget: 1000000,
                goalCurrent: 342500,
                startDate: d(-20),
                endDate: d(90),
                targetAudience: ["All Members", "Donors"],
                publishedAt: d(-20),
                viewCount: 9800,
                clickCount: 5400,
                shareCount: 2100,
                likeCount: 3100,
                participantCount: 1540,
                parentCampaignId: "camp-mega-1",
                createdAt: d(-22),
            },
        ],
    });
    console.log("  ✓ Campaigns");

    // ─── Participations ──────────────────────────────────────────────────────

    await prisma.campaignParticipation.createMany({
        data: [
            { id: "part-1", userId: "user-1", campaignId: "camp-1", joinedAt: d(-9), smartLinkId: "link-1-1" },
            { id: "part-2", userId: "user-1", campaignId: "camp-2", joinedAt: d(-19), smartLinkId: "link-1-2" },
            { id: "part-3", userId: "user-2", campaignId: "camp-1", joinedAt: d(-8), smartLinkId: "link-2-1" },
            { id: "part-4", userId: "user-lead-1", campaignId: "camp-1", joinedAt: d(-9) },
            { id: "part-5", userId: "user-lead-1", campaignId: "camp-2", joinedAt: d(-19) },
            { id: "part-6", userId: "user-1", campaignId: "camp-4", joinedAt: d(-4) },
            { id: "part-7", userId: "user-admin-1", campaignId: "camp-1", joinedAt: d(-10) },
            { id: "part-8", userId: "user-admin-1", campaignId: "camp-2", joinedAt: d(-20), smartLinkId: "link-admin-1" },
            { id: "part-9", userId: "user-super-1", campaignId: "camp-3", joinedAt: d(-15) },
        ],
    });
    console.log("  ✓ Participations");

    // ─── Smart Links ─────────────────────────────────────────────────────────

    const smartLinksData = [
        { id: "link-1-1", slug: "x4k9mq2", userId: "user-1", campaignId: "camp-1", originalUrl: "http://localhost:3000/campaigns/camp-1", clickCount: 143, uniqueClickCount: 98, conversionCount: 12, expiresAt: d(20), createdAt: d(-9) },
        { id: "link-1-2", slug: "p8r3zt5", userId: "user-1", campaignId: "camp-2", originalUrl: "http://localhost:3000/campaigns/camp-2", clickCount: 89, uniqueClickCount: 61, conversionCount: 7, expiresAt: d(10), createdAt: d(-19) },
        { id: "link-2-1", slug: "n6w1vy8", userId: "user-2", campaignId: "camp-1", originalUrl: "http://localhost:3000/campaigns/camp-1", clickCount: 67, uniqueClickCount: 45, conversionCount: 5, expiresAt: d(20), createdAt: d(-8) },
        { id: "link-lead-1", slug: "m2j5lk9", userId: "user-lead-1", campaignId: "camp-1", originalUrl: "http://localhost:3000/campaigns/camp-1", clickCount: 312, uniqueClickCount: 215, conversionCount: 28, expiresAt: d(20), createdAt: d(-9) },
        { id: "link-admin-1", slug: "a1b2cd3", userId: "user-admin-1", campaignId: "camp-1", originalUrl: "http://localhost:3000/campaigns/camp-1", clickCount: 201, uniqueClickCount: 165, conversionCount: 18, expiresAt: d(20), createdAt: d(-10) },
        { id: "link-admin-2", slug: "e4f5gh6", userId: "user-admin-1", campaignId: "camp-2", originalUrl: "http://localhost:3000/campaigns/camp-2", clickCount: 178, uniqueClickCount: 132, conversionCount: 14, expiresAt: d(10), createdAt: d(-20) },
    ];

    await prisma.smartLink.createMany({ data: smartLinksData });
    console.log("  ✓ Smart Links");

    // ─── Link Events ─────────────────────────────────────────────────────────

    const eventTypes: Array<"CLICK" | "VIEW" | "SHARE"> = ["CLICK", "VIEW", "SHARE"];
    const countries = ["NG", "GH", "UK", "US"];

    await prisma.linkEvent.createMany({
        data: Array.from({ length: 20 }, (_, i) => {
            const link = smartLinksData[i % smartLinksData.length];
            const eventType = eventTypes[i % 3];
            return {
                id: `event-${i + 1}`,
                linkId: link.id,
                smartLinkId: link.id,
                slug: link.slug,
                eventType,
                type: eventType,
                ipHash: `hash-${i}`,
                userAgent: "Mozilla/5.0",
                country: countries[i % 4],
                createdAt: d(-i),
            };
        }),
    });
    console.log("  ✓ Link Events");

    // ─── Referrals ───────────────────────────────────────────────────────────

    await prisma.referral.createMany({
        data: [
            { id: "ref-1", inviterId: "user-lead-1", inviteeId: "user-1", campaignId: "camp-1", slug: "m2j5lk9", createdAt: d(-9) },
            { id: "ref-2", inviterId: "user-1", inviteeId: "user-2", campaignId: "camp-1", slug: "x4k9mq2", createdAt: d(-7) },
        ],
    });
    console.log("  ✓ Referrals");

    // ─── Donations ───────────────────────────────────────────────────────────

    await prisma.donation.createMany({
        data: [
            { id: "don-1", userId: "user-1", campaignId: "camp-3", amount: 5000, currency: "NGN", status: "COMPLETED", reference: "TXN001", createdAt: d(-5) },
            { id: "don-2", userId: "user-2", campaignId: "camp-3", amount: 10000, currency: "NGN", status: "COMPLETED", reference: "TXN002", createdAt: d(-4) },
            { id: "don-3", userId: "user-lead-1", campaignId: "camp-3", amount: 25000, currency: "NGN", status: "COMPLETED", reference: "TXN003", createdAt: d(-3) },
            { id: "don-4", userId: "user-1", campaignId: "camp-3", amount: 7500, currency: "NGN", status: "COMPLETED", reference: "TXN004", createdAt: d(-2) },
            { id: "don-5", userId: "user-admin-1", campaignId: "camp-3", amount: 50000, currency: "NGN", status: "COMPLETED", reference: "TXN005", createdAt: d(-6) },
        ],
    });
    console.log("  ✓ Donations");

    // ─── Points Ledger ───────────────────────────────────────────────────────

    await prisma.pointsLedgerEntry.createMany({
        data: [
            { id: "pt-1", userId: "user-1", campaignId: "camp-1", type: "IMPACT", value: 143, description: "Clicks received on smart link", createdAt: d(-9) },
            { id: "pt-2", userId: "user-1", campaignId: "camp-1", type: "LEADERSHIP", value: 25, description: "Referral joined campaign", referenceId: "ref-2", createdAt: d(-7) },
            { id: "pt-3", userId: "user-1", campaignId: "camp-2", type: "IMPACT", value: 89, description: "Clicks received on smart link", createdAt: d(-5) },
            { id: "pt-4", userId: "user-lead-1", campaignId: "camp-1", type: "IMPACT", value: 312, description: "Clicks received on smart link", createdAt: d(-9) },
            { id: "pt-5", userId: "user-lead-1", campaignId: "camp-1", type: "LEADERSHIP", value: 25, description: "Referral joined campaign", referenceId: "ref-1", createdAt: d(-9) },
            { id: "pt-6", userId: "user-lead-1", type: "CONSISTENCY", value: 25, description: "Weekly streak bonus", createdAt: d(-7) },
            { id: "pt-7", userId: "user-2", campaignId: "camp-1", type: "IMPACT", value: 67, description: "Clicks received on smart link", createdAt: d(-8) },
            { id: "pt-8", userId: "user-admin-1", campaignId: "camp-1", type: "IMPACT", value: 201, description: "Clicks received on smart link", createdAt: d(-10) },
            { id: "pt-9", userId: "user-admin-1", campaignId: "camp-2", type: "IMPACT", value: 178, description: "Clicks received on smart link", createdAt: d(-20) },
            { id: "pt-10", userId: "user-admin-1", type: "RELIABILITY", value: 50, description: "Content reviewed and approved", createdAt: d(-5) },
            { id: "pt-11", userId: "user-super-1", campaignId: "camp-3", type: "IMPACT", value: 150, description: "Campaign oversight contribution", createdAt: d(-15) },
            { id: "pt-12", userId: "user-super-1", type: "CONSISTENCY", value: 50, description: "Weekly streak bonus", createdAt: d(-7) },
        ],
    });
    console.log("  ✓ Points Ledger");

    // ─── Leaderboard Snapshots ───────────────────────────────────────────────

    await prisma.leaderboardSnapshot.createMany({
        data: [
            // camp-1
            { id: "lb-1", userId: "user-lead-1", campaignId: "camp-1", period: "2026-W03", rank: 1, score: 362, createdAt: d(-7) },
            { id: "lb-2", userId: "user-1", campaignId: "camp-1", period: "2026-W03", rank: 2, score: 257, createdAt: d(-7) },
            { id: "lb-3", userId: "user-admin-1", campaignId: "camp-1", period: "2026-W03", rank: 3, score: 201, createdAt: d(-7) },
            { id: "lb-4", userId: "user-super-1", campaignId: "camp-1", period: "2026-W03", rank: 4, score: 150, createdAt: d(-7) },
            { id: "lb-5", userId: "user-2", campaignId: "camp-1", period: "2026-W03", rank: 5, score: 67, createdAt: d(-7) },
            // camp-2
            { id: "lb-6", userId: "user-admin-1", campaignId: "camp-2", period: "2026-W03", rank: 1, score: 178, createdAt: d(-7) },
            { id: "lb-7", userId: "user-lead-1", campaignId: "camp-2", period: "2026-W03", rank: 2, score: 145, createdAt: d(-7) },
            { id: "lb-8", userId: "user-1", campaignId: "camp-2", period: "2026-W03", rank: 3, score: 89, createdAt: d(-7) },
            { id: "lb-9", userId: "user-2", campaignId: "camp-2", period: "2026-W03", rank: 4, score: 55, createdAt: d(-7) },
            { id: "lb-10", userId: "user-super-1", campaignId: "camp-2", period: "2026-W03", rank: 5, score: 30, createdAt: d(-7) },
            // camp-3
            { id: "lb-11", userId: "user-super-1", campaignId: "camp-3", period: "2026-W03", rank: 1, score: 200, createdAt: d(-7) },
            { id: "lb-12", userId: "user-admin-1", campaignId: "camp-3", period: "2026-W03", rank: 2, score: 180, createdAt: d(-7) },
            { id: "lb-13", userId: "user-lead-1", campaignId: "camp-3", period: "2026-W03", rank: 3, score: 120, createdAt: d(-7) },
            { id: "lb-14", userId: "user-1", campaignId: "camp-3", period: "2026-W03", rank: 4, score: 70, createdAt: d(-7) },
            { id: "lb-15", userId: "user-2", campaignId: "camp-3", period: "2026-W03", rank: 5, score: 40, createdAt: d(-7) },
            // camp-4
            { id: "lb-16", userId: "user-1", campaignId: "camp-4", period: "2026-W03", rank: 1, score: 130, createdAt: d(-3) },
            { id: "lb-17", userId: "user-lead-1", campaignId: "camp-4", period: "2026-W03", rank: 2, score: 95, createdAt: d(-3) },
            { id: "lb-18", userId: "user-2", campaignId: "camp-4", period: "2026-W03", rank: 3, score: 60, createdAt: d(-3) },
            { id: "lb-19", userId: "user-admin-1", campaignId: "camp-4", period: "2026-W03", rank: 4, score: 45, createdAt: d(-3) },
            { id: "lb-20", userId: "user-super-1", campaignId: "camp-4", period: "2026-W03", rank: 5, score: 20, createdAt: d(-3) },
        ],
    });
    console.log("  ✓ Leaderboard Snapshots");

    // ─── Trust Scores ────────────────────────────────────────────────────────

    const userScores: Record<string, number> = {
        "user-super-1": 100,
        "user-admin-1": 98,
        "user-lead-1": 95,
        "user-1": 87,
        "user-2": 72,
    };

    for (const [userId, score] of Object.entries(userScores)) {
        await prisma.trustScore.create({
            data: { id: `trust-${userId}`, userId, score },
        });
    }
    console.log("  ✓ Trust Scores");

    // ─── View Proofs ─────────────────────────────────────────────────────────

    await prisma.viewProof.createMany({
        data: [
            {
                id: "proof-1",
                userId: "user-1",
                campaignId: "camp-1",
                smartLinkId: "link-1-1",
                platform: "FACEBOOK",
                screenshotUrl: "https://picsum.photos/seed/proof1/400/700",
                status: "APPROVED",
                reviewedById: "user-admin-1",
                reviewedAt: d(-3),
                createdAt: d(-5),
            },
            {
                id: "proof-2",
                userId: "user-1",
                campaignId: "camp-1",
                smartLinkId: "link-1-1",
                platform: "WHATSAPP",
                screenshotUrl: "https://picsum.photos/seed/proof2/400/700",
                status: "PENDING",
                createdAt: d(-2),
            },
            {
                id: "proof-3",
                userId: "user-2",
                campaignId: "camp-1",
                smartLinkId: "link-2-1",
                platform: "TWITTER_X",
                screenshotUrl: "https://picsum.photos/seed/proof3/400/700",
                status: "APPROVED",
                reviewedById: "user-admin-1",
                reviewedAt: d(-1),
                createdAt: d(-4),
            },
            {
                id: "proof-4",
                userId: "user-lead-1",
                campaignId: "camp-mega-1",
                smartLinkId: "link-lead-1",
                platform: "INSTAGRAM",
                screenshotUrl: "https://picsum.photos/seed/proof4/400/700",
                status: "PENDING",
                createdAt: d(-1),
            },
        ],
    });
    console.log("  ✓ View Proofs");

    // ─── Notifications ───────────────────────────────────────────────────────

    await prisma.appNotification.createMany({
        data: [
            { id: "notif-1", userId: "user-1", type: "CAMPAIGN_UPDATE", title: "Easter Harvest Drive updated", body: "The Easter Harvest Drive 2026 campaign has a new milestone — 347 participants and counting!", isRead: false, link: "/campaigns/camp-1", createdAt: d(-1) },
            { id: "notif-2", userId: "user-1", type: "REFERRAL_JOINED", title: "Your referral joined a campaign", body: "Tunde Babatunde joined the Easter Harvest Drive using your smart link.", isRead: false, link: "/campaigns/camp-1", createdAt: d(-2) },
            { id: "notif-3", userId: "user-1", type: "POINTS_EARNED", title: "You earned 25 points", body: "You received 25 Leadership points for a successful referral on Easter Harvest Drive.", isRead: true, link: "/leaderboard", createdAt: d(-3) },
            { id: "notif-4", userId: "user-lead-1", type: "CAMPAIGN_UPDATE", title: "Youth Ignite Conference is live", body: "Youth Ignite Conference campaign is now active. Start sharing to reach your goal.", isRead: false, link: "/campaigns/camp-4", createdAt: d(-1) },
            { id: "notif-5", userId: "user-lead-1", type: "POINTS_EARNED", title: "Weekly streak bonus earned", body: "You maintained a 7-day activity streak and earned 25 Consistency points.", isRead: false, link: "/leaderboard", createdAt: d(-2) },
            { id: "notif-6", userId: "user-admin-1", type: "TRUST_FLAG", title: "Trust flag needs review", body: "A new trust flag has been submitted for review. Check the Trust Review dashboard.", isRead: false, link: "/trust-review", createdAt: d(-1) },
            { id: "notif-7", userId: "user-admin-1", type: "CAMPAIGN_UPDATE", title: "Community Giving Initiative milestone", body: "The Community Giving Initiative has reached 37% of its donation goal — ₦187,350 raised.", isRead: true, link: "/campaigns/camp-3", createdAt: d(-3) },
            { id: "notif-8", userId: "user-admin-1", type: "SYSTEM", title: "Platform update deployed", body: "DMHicc has been updated with new analytics and leaderboard features. Explore what's new.", isRead: true, createdAt: d(-5) },
        ],
    });
    console.log("  ✓ Notifications");

    // ─── Team Invite Links ───────────────────────────────────────────────────

    await prisma.teamInviteLink.createMany({
        data: [
            { id: "invite-1", token: "alpha-warriors-join", teamId: "team-1", targetRole: "MEMBER", createdById: "user-lead-1", usedCount: 0, maxUses: 7, isActive: true, createdAt: d(-10) },
            { id: "invite-2", token: "insta-squad-lead", teamId: "team-2", targetRole: "TEAM_LEAD", createdById: "user-admin-1", usedCount: 0, maxUses: 1, isActive: true, createdAt: d(-8) },
        ],
    });
    console.log("  ✓ Team Invite Links");

    // ─── Campaign Audit Events ───────────────────────────────────────────────

    await prisma.campaignAuditEvent.createMany({
        data: [
            { id: "audit-1", campaignId: "camp-1", actorId: "user-admin-1", actorRole: "ADMIN", eventType: "CREATED", after: { title: "Easter Harvest Drive 2026", status: "DRAFT" }, createdAt: d(-12) },
            { id: "audit-2", campaignId: "camp-1", actorId: "user-admin-1", actorRole: "ADMIN", eventType: "STATUS_CHANGED", before: { status: "DRAFT" }, after: { status: "ACTIVE" }, note: "Campaign launched for Easter", createdAt: d(-10) },
            { id: "audit-3", campaignId: "camp-1", actorId: "user-1", actorRole: "USER", eventType: "PARTICIPANT_JOINED", note: "Adaeze Okafor joined the campaign", createdAt: d(-9) },
            { id: "audit-4", campaignId: "camp-1", actorId: "user-2", actorRole: "USER", eventType: "DONATION_RECEIVED", after: { amount: 5000, currency: "NGN" }, note: "Tunde Babatunde donated ₦5,000", createdAt: d(-7) },
            { id: "audit-5", campaignId: "camp-2", actorId: "user-admin-1", actorRole: "ADMIN", eventType: "CREATED", after: { title: "Digital Outreach January", status: "DRAFT" }, createdAt: d(-55) },
        ],
    });
    console.log("  ✓ Campaign Audit Events");

    console.log("\n✅ Seed complete — all tables populated.");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
