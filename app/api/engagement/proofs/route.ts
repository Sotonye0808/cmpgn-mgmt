import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize } from "@/lib/utils/serialize";
import { z } from "zod";

const createProofSchema = z.object({
    campaignId: z.string().min(1),
    smartLinkId: z.string().min(1),
    platform: z.enum([
        "FACEBOOK",
        "INSTAGRAM",
        "TWITTER_X",
        "TIKTOK",
        "YOUTUBE",
        "WHATSAPP",
        "SNAPCHAT",
    ]),
    screenshotUrl: z.string().url(),
    viewCount: z.number().int().min(0).optional(),
});

// POST — submit a new view proof
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await requireAuth();
        if (error) return error;

        const body = await request.json();
        const parsed = createProofSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const proof = await prisma.viewProof.create({
            data: {
                userId: user.id,
                campaignId: parsed.data.campaignId,
                smartLinkId: parsed.data.smartLinkId,
                platform: parsed.data.platform as never,
                screenshotUrl: parsed.data.screenshotUrl,
                viewCount: parsed.data.viewCount ?? null,
                status: "PENDING" as never,
            },
        });

        await redis.invalidatePattern("proofs:");
        return successResponse(serialize(proof), 201);
    } catch (err) {
        return handleApiError(err);
    }
}

// GET — list view proofs (own proofs for users, team proofs for team_lead, all for admins)
export async function GET(request: NextRequest) {
    try {
        const { user, error } = await requireAuth();
        if (error) return error;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;
        const scope = request.nextUrl.searchParams.get("scope") ?? undefined; // "team" | undefined
        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        const isTeamLead = user.role === "TEAM_LEAD";

        const where: Record<string, unknown> = {};

        if (isAdmin) {
            // Admins see all proofs
        } else if (isTeamLead && scope === "team") {
            // Team leads see proofs from their team members
            const currentUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { teamId: true },
            });

            if (currentUser?.teamId) {
                const teamMembers = await prisma.user.findMany({
                    where: { teamId: currentUser.teamId },
                    select: { id: true },
                });
                const memberUserIds = teamMembers.map((m: { id: string }) => m.id);
                where.userId = { in: memberUserIds };
            } else {
                // No team — fall back to own proofs only
                where.userId = user.id;
            }
        } else {
            // Regular users see only their own proofs
            where.userId = user.id;
        }

        if (campaignId) where.campaignId = campaignId;

        const proofs = await prisma.viewProof.findMany({
            where: where as never,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                campaign: { select: { id: true, title: true } },
            },
        });

        // Enrich with user name and campaign title
        const enriched = proofs.map((p) => {
            const base = serialize<Record<string, unknown>>(p);
            return {
                ...base,
                userName: p.user ? `${p.user.firstName} ${p.user.lastName}` : undefined,
                campaignTitle: p.campaign?.title ?? undefined,
            };
        });

        return successResponse(enriched);
    } catch (err) {
        return handleApiError(err);
    }
}
