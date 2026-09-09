import httpStatus from "http-status";
import { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/handleAppError";
import { ProductModel } from "../product/product.model";
import { TCampaign } from "./campaign.interface";
import { CampaignModel } from "./campaign.model";

const getAllCampaignsFromDB = async (query: Record<string, unknown>) => {
  return new QueryBuilder(
    CampaignModel.find().populate("products.productId", "description productInfo featuredImg"),
    query
  )
    .search(["name", "type", "status"])
    .filter()
    .sort()
    .paginate()
    .fields().modelQuery;
};

const getSingleCampaignFromDB = async (id: string) => {
  const result = await CampaignModel.findById(id).populate(
    "products.productId",
    "description productInfo featuredImg"
  );
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Campaign does not exist!");
  return result;
};

const getActiveCampaignsFromDB = async () => {
  const now = new Date();
  return CampaignModel.find({
    status: { $in: ["scheduled", "active"] },
    startAt: { $lte: now },
    endAt: { $gte: now },
  }).populate("products.productId", "description productInfo featuredImg");
};

const validateProductsAndOverlap = async (payload: TCampaign, campaignId?: string) => {
  const productIds = payload.products.map((item) => item.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).select(
    "_id productInfo.price productInfo.quantity"
  );
  if (products.length !== productIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, "One or more products do not exist!");
  }

  for (const item of payload.products) {
    const product = products.find((entry) => entry._id.toString() === item.productId.toString());
    if (!product) continue;
    if (item.salePrice >= product.productInfo.price) {
      throw new AppError(httpStatus.BAD_REQUEST, "Campaign sale price must be lower than regular price!");
    }
    if (item.stockLimit > product.productInfo.quantity) {
      throw new AppError(httpStatus.BAD_REQUEST, "Campaign stock cannot exceed product stock!");
    }
  }

  const overlap = await CampaignModel.findOne({
    _id: campaignId ? { $ne: campaignId } : { $exists: true },
    status: { $in: ["scheduled", "active"] },
    startAt: { $lt: payload.endAt },
    endAt: { $gt: payload.startAt },
    "products.productId": { $in: productIds },
  });
  if (overlap) {
    throw new AppError(httpStatus.CONFLICT, "A product already has an overlapping campaign!");
  }
};

const createCampaignIntoDB = async (payload: TCampaign) => {
  await validateProductsAndOverlap(payload);
  return CampaignModel.create(payload);
};

const updateCampaignIntoDB = async (id: string, payload: Partial<TCampaign>) => {
  const existing = await CampaignModel.findById(id);
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Campaign does not exist!");
  const merged = { ...existing.toObject(), ...payload } as TCampaign;
  await validateProductsAndOverlap(merged, id);
  return CampaignModel.findByIdAndUpdate(id, payload, { new: true });
};

const updateCampaignStatusIntoDB = async (id: string, status: TCampaign["status"]) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid campaign id!");
  const result = await CampaignModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Campaign does not exist!");
  return result;
};

const deleteCampaignFromDB = async (id: string) => {
  const result = await CampaignModel.findByIdAndDelete(id);
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Campaign does not exist!");
  return result;
};

export const campaignServices = {
  getAllCampaignsFromDB,
  getSingleCampaignFromDB,
  getActiveCampaignsFromDB,
  createCampaignIntoDB,
  updateCampaignIntoDB,
  updateCampaignStatusIntoDB,
  deleteCampaignFromDB,
};
