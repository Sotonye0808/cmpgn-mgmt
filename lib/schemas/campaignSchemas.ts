import { z } from "zod";

const campaignBaseFields = {
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().min(10, "Description must be at least 10 characters").max(500),
    content: z.string().optional().default(""),
    mediaType: z.enum(["IMAGE", "VIDEO", "LINK", "TEXT"]).optional(),
    mediaUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    ctaText: z.string().max(60).optional(),
    ctaUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    goalType: z.enum(["SHARES", "CLICKS", "REFERRALS", "DONATIONS", "PARTICIPANTS"]).optional(),
    goalTarget: z.number().int().positive().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    targetAudience: z.array(z.string()).optional(),
    metaTitle: z.string().max(120).optional(),
    metaDescription: z.string().max(300).optional(),
    metaImage: z.string().url().optional().or(z.literal("")),
    publishImmediately: z.boolean().optional(),
} as const;

/** Cross-field validation: enforce fields that are required only for certain media types */
function validateMediaTypeDeps(data: Record<string, unknown>, ctx: z.RefinementCtx) {
    const mediaType = data.mediaType as string | undefined;

    // content is required only for TEXT campaigns
    if (mediaType === "TEXT" && (!data.content || String(data.content).trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Content is required for text campaigns",
            path: ["content"],
        });
    }

    // mediaUrl is required for LINK campaigns
    if (mediaType === "LINK" && (!data.mediaUrl || String(data.mediaUrl).trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A URL is required for link campaigns",
            path: ["mediaUrl"],
        });
    }

    // mediaUrl is required for IMAGE / VIDEO campaigns (set via upload)
    if ((mediaType === "IMAGE" || mediaType === "VIDEO") && (!data.mediaUrl || String(data.mediaUrl).trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Media upload is required for ${String(mediaType).toLowerCase()} campaigns`,
            path: ["mediaUrl"],
        });
    }
}

export const createCampaignSchema = z.object(campaignBaseFields).superRefine(validateMediaTypeDeps);

export const updateCampaignSchema = z.object(campaignBaseFields).partial().extend({
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
}).superRefine(validateMediaTypeDeps);

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
