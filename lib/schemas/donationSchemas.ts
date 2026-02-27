import { z } from "zod";

export const createDonationSchema = z.object({
    campaignId: z.string().min(1, "Campaign is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
    message: z.string().max(200).optional(),
});

export type CreateDonationPayload = z.infer<typeof createDonationSchema>;
