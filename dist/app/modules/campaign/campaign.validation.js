"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignStatusSchema = exports.createCampaignSchema = void 0;
const zod_1 = require("zod");
const campaignProductSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    discountType: zod_1.z.enum(["percentage", "fixed-price"]),
    discountValue: zod_1.z.number().min(0),
    salePrice: zod_1.z.number().min(0),
    stockLimit: zod_1.z.number().int().min(0),
});
exports.createCampaignSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(["flash-sale", "deal-of-day"]),
    status: zod_1.z.enum(["draft", "scheduled", "active", "paused"]).optional(),
    products: zod_1.z.array(campaignProductSchema).min(1),
    startAt: zod_1.z.string().datetime(),
    endAt: zod_1.z.string().datetime(),
})
    .refine((value) => new Date(value.startAt) < new Date(value.endAt), {
    message: "startAt must be before endAt",
    path: ["endAt"],
});
exports.updateCampaignStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["draft", "scheduled", "active", "paused", "expired"]),
});
