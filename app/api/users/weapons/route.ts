import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";
import { z } from "zod";

const weaponsSchema = z.object({
    weaponsOfChoice: z.array(
        z.enum([
            "FACEBOOK",
            "INSTAGRAM",
            "TWITTER_X",
            "TIKTOK",
            "YOUTUBE",
            "WHATSAPP",
            "SNAPCHAT",
        ])
    ).min(1, "Select at least one platform"),
});

// PUT — update current user's weapons of choice
export async function PUT(request: NextRequest) {
    try {
        const { user, error } = await requireAuth();
        if (error) return error;

        const body = await request.json();
        const parsed = weaponsSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                weaponsOfChoice: parsed.data.weaponsOfChoice as unknown as SocialPlatform[],
            },
        });

        return successResponse(serialize(updated));
    } catch (err) {
        return handleApiError(err);
    }
}

// GET — get current user's weapons of choice
export async function GET() {
    try {
        const { user, error } = await requireAuth();
        if (error) return error;

        const found = await prisma.user.findUnique({ where: { id: user.id } });
        return successResponse({ weaponsOfChoice: found?.weaponsOfChoice ?? [] });
    } catch (err) {
        return handleApiError(err);
    }
}
