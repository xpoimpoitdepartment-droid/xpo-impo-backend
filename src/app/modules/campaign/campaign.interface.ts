import { Types } from "mongoose";

export type TCampaignProduct = {
  productId: Types.ObjectId;
  discountType: "percentage" | "fixed-price";
  discountValue: number;
  salePrice: number;
  stockLimit: number;
  soldQuantity?: number;
};

export type TCampaign = {
  name: string;
  type: "flash-sale" | "deal-of-day";
  status: "draft" | "scheduled" | "active" | "paused" | "expired";
  products: TCampaignProduct[];
  startAt: Date;
  endAt: Date;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
};
