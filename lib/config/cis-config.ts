import { z } from "zod";

const cisEnvSchema = z.object({
    CIS_API_URL: z.string().url().optional(),
    CIS_PLATFORM_SLUG: z.string().trim().min(1).default("dmhicc"),
    CIS_CLIENT_ID: z.string().trim().min(1).optional(),
    CIS_CLIENT_SECRET: z.string().trim().min(1).optional(),
    CIS_WEBHOOK_SECRET: z.string().trim().min(1).optional(),
    CIS_WEBHOOK_PATH: z.string().trim().min(1).default("/api/cis/webhook"),
    CIS_WEBHOOK_ALLOWED_SKEW_SECONDS: z.coerce.number().int().min(1).default(300),
});

const parsedEnv = cisEnvSchema.parse(process.env);

export const cisConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "DMHicc",
    appUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
    apiUrl: parsedEnv.CIS_API_URL ?? null,
    platformSlug: parsedEnv.CIS_PLATFORM_SLUG,
    clientId: parsedEnv.CIS_CLIENT_ID ?? null,
    clientSecret: parsedEnv.CIS_CLIENT_SECRET ?? null,
    webhookSecret: parsedEnv.CIS_WEBHOOK_SECRET ?? null,
    webhookPath: parsedEnv.CIS_WEBHOOK_PATH,
    webhookAllowedSkewSeconds: parsedEnv.CIS_WEBHOOK_ALLOWED_SKEW_SECONDS,
    ready: Boolean(
        parsedEnv.CIS_API_URL &&
        parsedEnv.CIS_CLIENT_ID &&
        parsedEnv.CIS_CLIENT_SECRET &&
        parsedEnv.CIS_WEBHOOK_SECRET
    ),
} as const;
