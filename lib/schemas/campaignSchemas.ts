import { z } from "zod";

export const createCampaignSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().min(10, "Description must be at least 10 characters").max(500),
    content: z.string().min(1, "Content is required"),
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
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
