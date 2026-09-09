import { model, Schema } from "mongoose";
import { TCampaign, TCampaignProduct } from "./campaign.interface";

const campaignProductSchema = new Schema<TCampaignProduct>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed-price"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    stockLimit: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const campaignSchema = new Schema<TCampaign>(
  {
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
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, startAt: 1, endAt: 1 });
campaignSchema.index({ "products.productId": 1, startAt: 1, endAt: 1 });

export const CampaignModel = model<TCampaign>("campaign", campaignSchema);
