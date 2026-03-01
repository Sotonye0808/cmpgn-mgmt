import { z } from "zod";

export const createDonationSchema = z.object({
    campaignId: z.string().min(1, "Campaign is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
    message: z.string().max(200).optional(),
    bankAccountId: z.string().optional(),
    proofScreenshotUrl: z.string().url("Must be a valid URL").optional(),
    notes: z.string().max(500).optional(),
});

export const verifyDonationSchema = z.object({
    action: z.enum(["VERIFIED", "REJECTED"]),
    notes: z.string().max(500).optional(),
});

export const uploadProofSchema = z.object({
    proofScreenshotUrl: z.string().url("Must be a valid URL"),
});

export type CreateDonationPayload = z.infer<typeof createDonationSchema>;
export type VerifyDonationPayload = z.infer<typeof verifyDonationSchema>;
export type UploadProofPayload = z.infer<typeof uploadProofSchema>;
