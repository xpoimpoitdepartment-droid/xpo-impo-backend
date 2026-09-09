import { z } from "zod";

const campaignProductSchema = z.object({
  productId: z.string().min(1),
  discountType: z.enum(["percentage", "fixed-price"]),
  discountValue: z.number().min(0),
  salePrice: z.number().min(0),
  stockLimit: z.number().int().min(0),
});

export const createCampaignSchema = z
  .object({
    name: z.string().min(1),
    type: z.enum(["flash-sale", "deal-of-day"]),
    status: z.enum(["draft", "scheduled", "active", "paused"]).optional(),
    products: z.array(campaignProductSchema).min(1),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
  })
  .refine((value) => new Date(value.startAt) < new Date(value.endAt), {
    message: "startAt must be before endAt",
    path: ["endAt"],
  });

export const updateCampaignStatusSchema = z.object({
  status: z.enum(["draft", "scheduled", "active", "paused", "expired"]),
});
