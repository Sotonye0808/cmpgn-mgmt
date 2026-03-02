import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serialize, serializeArray } from "@/lib/utils/serialize";
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
                status: "PENDING" as never,
            },
        });

        return successResponse(serialize(proof), 201);
    } catch (err) {
        return handleApiError(err);
    }
}

// GET — list view proofs (own proofs for users, all for admins)
export async function GET(request: NextRequest) {
    try {
        const { user, error } = await requireAuth();
        if (error) return error;

        const campaignId = request.nextUrl.searchParams.get("campaignId") ?? undefined;
        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

        const where: Record<string, unknown> = {};
        if (!isAdmin) where.userId = user.id;
        if (campaignId) where.campaignId = campaignId;

        const proofs = await prisma.viewProof.findMany({ where: where as never });

        return successResponse(serializeArray(proofs));
    } catch (err) {
        return handleApiError(err);
    }
}
