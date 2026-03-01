import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { mockDb } from "@/lib/data/mockDb";
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

        const now = new Date().toISOString();
        const proof = mockDb.viewProofs.create({
            data: {
                userId: user.id,
                campaignId: parsed.data.campaignId,
                smartLinkId: parsed.data.smartLinkId,
                platform: parsed.data.platform as unknown as SocialPlatform,
                screenshotUrl: parsed.data.screenshotUrl,
                status: "PENDING" as unknown as ViewProofStatus,
                createdAt: now,
                updatedAt: now,
            },
        });

        mockDb.emit("viewProofs:changed");
        return successResponse(proof, 201);
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

        let proofs: ViewProof[];
        if (isAdmin) {
            proofs = campaignId
                ? mockDb.viewProofs.findMany({ where: { campaignId } as Partial<ViewProof> })
                : mockDb.viewProofs.findMany();
        } else {
            const where: Partial<ViewProof> = { userId: user.id };
            if (campaignId) (where as Record<string, unknown>).campaignId = campaignId;
            proofs = mockDb.viewProofs.findMany({ where });
        }

        return successResponse(proofs);
    } catch (err) {
        return handleApiError(err);
    }
}
