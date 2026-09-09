"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModel = void 0;
const mongoose_1 = require("mongoose");
const campaignProductSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "product", required: true },
    discountType: {
        type: String,
        enum: ["percentage", "fixed-price"],
        required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    stockLimit: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, default: 0, min: 0 },
}, { _id: false });
const campaignSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["flash-sale", "deal-of-day"], required: true },
    status: {
        type: String,
        enum: ["draft", "scheduled", "active", "paused", "expired"],
        default: "scheduled",
    },
    products: { type: [campaignProductSchema], required: true, default: [] },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
}, { timestamps: true });
campaignSchema.index({ status: 1, startAt: 1, endAt: 1 });
campaignSchema.index({ "products.productId": 1, startAt: 1, endAt: 1 });
exports.CampaignModel = (0, mongoose_1.model)("campaign", campaignSchema);
