import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";

const updateProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    profilePicture: z.string().url("Must be a valid URL").optional(),
    whatsappNumber: z
        .string()
        .regex(/^\+\d{1,4}\d{6,15}$/, "Invalid WhatsApp number format")
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
});

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
        return successResponse(serialize(user));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const user = auth.user;

        const body = await request.json();
        const parsed = updateProfileSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                ...(parsed.data.profilePicture !== undefined && {
                    profilePicture: parsed.data.profilePicture,
                }),
                // Allow explicit clear (undefined) or set new number
                whatsappNumber: parsed.data.whatsappNumber,
            },
        });

        return successResponse(serialize(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
