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
import { MAX_PROOF_SCREENSHOTS } from "@/modules/proofs/config";
import { buildProofReviewAccess } from "@/modules/proofs/services/proofReviewAccess";

// Accepts either a single legacy `screenshotUrl` or the new `screenshotUrls`
// array (max MAX_PROOF_SCREENSHOTS). `.or()` keeps old clients working.
const createProofSchema = z
    .object({
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
        screenshotUrl: z.string().url().optional(),
        screenshotUrls: z
            .array(z.string().url())
            .min(1)
            .max(MAX_PROOF_SCREENSHOTS)
            .optional(),
        viewCount: z.number().int().min(0),
    })
    .refine(
        (data) =>
            Boolean(data.screenshotUrls?.length) || Boolean(data.screenshotUrl),
        { message: "At least one screenshot is required" }
    );

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

        // Normalize: screenshotUrls wins; legacy screenshotUrl is wrapped.
        // Dedupe + cap defensively against a client sending more than allowed.
        const urls = Array.from(
            new Set([
                ...(parsed.data.screenshotUrls ?? []),
                ...(parsed.data.screenshotUrl ? [parsed.data.screenshotUrl] : []),
            ])
        ).slice(0, MAX_PROOF_SCREENSHOTS);

        if (urls.length === 0) {
            return badRequestResponse("At least one screenshot is required");
        }

        const proof = await prisma.viewProof.create({
            data: {
                userId: user.id,
                campaignId: parsed.data.campaignId,
                smartLinkId: parsed.data.smartLinkId,
                platform: parsed.data.platform as never,
                screenshotUrl: urls[0],
                screenshotUrls: urls,
                viewCount: parsed.data.viewCount,
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
        // Campaigns a team lead is permitted to verify — null means "any campaign"
        let allowedCampaignIds: string[] | null = null;

        if (isAdmin) {
            // Admins see all proofs
        } else if (isTeamLead && scope === "team") {
            // Team leads see proofs from their team members, scoped to the
            // campaigns they've been assigned to (falling back to all
            // campaigns when they have no assignments yet).
            const ctx = await buildProofReviewAccess(user);
            if (ctx.managedCampaignIds.length > 0) {
                allowedCampaignIds = ctx.managedCampaignIds;
            }
            where.userId =
                ctx.teamMemberIds.length > 0
                    ? { in: ctx.teamMemberIds }
                    : user.id;
        } else {
            // Regular users see only their own proofs
            where.userId = user.id;
        }

        if (campaignId) {
            // A team lead must not reach proofs outside their assigned campaigns
            // by filtering on a specific campaign id.
            if (allowedCampaignIds && !allowedCampaignIds.includes(campaignId)) {
                return successResponse([]);
            }
            where.campaignId = campaignId;
        } else if (allowedCampaignIds) {
            where.campaignId = { in: allowedCampaignIds };
        }

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
