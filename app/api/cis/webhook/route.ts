import { NextRequest } from "next/server";
import { z } from "zod";

import { cisConfig, verifyCisWebhookSignature } from "@/lib/config/cis";
import { recordCisWebhookEvent } from "@/modules/users/services/cisIdentityService";
import { badRequestResponse, errorResponse, handleApiError, successResponse } from "@/lib/utils/api";

const CisWebhookSchema = z.object({
    eventType: z.string().trim().min(1),
    sourcePlatform: z.string().trim().min(1),
    subjectId: z.string().trim().min(1).optional(),
    externalUserId: z.string().trim().min(1).optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        if (!rawBody.trim()) {
            return badRequestResponse("Empty webhook payload");
        }

        if (cisConfig.webhookSecret) {
            const signature = req.headers.get("x-cis-signature");
            const timestamp = req.headers.get("x-cis-timestamp");

            if (!verifyCisWebhookSignature({ payload: rawBody, signature, timestamp })) {
                return errorResponse("Invalid CIS webhook signature", 401);
            }
        } else if (process.env.NODE_ENV === "production") {
            return errorResponse("CIS webhook is not configured", 503);
        }

        let parsedBody: unknown;
        try {
            parsedBody = JSON.parse(rawBody) as unknown;
        } catch {
            return badRequestResponse("Webhook payload must be valid JSON");
        }

        const parsed = CisWebhookSchema.safeParse(parsedBody);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.message);
        }

        const persistence = await recordCisWebhookEvent({
            eventType: parsed.data.eventType,
            sourcePlatform: parsed.data.sourcePlatform,
            subjectId: parsed.data.subjectId,
            externalUserId: parsed.data.externalUserId,
            payload: parsed.data.payload,
        });

        return successResponse(
            {
                accepted: true,
                platformSlug: cisConfig.platformSlug,
                eventType: parsed.data.eventType,
                sourcePlatform: parsed.data.sourcePlatform,
                subjectId: parsed.data.subjectId ?? null,
                externalUserId: parsed.data.externalUserId ?? null,
                identityRecorded: Boolean(persistence.identityId),
            },
            202
        );
    } catch (err) {
        return handleApiError(err);
    }
}
