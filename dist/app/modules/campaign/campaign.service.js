"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const product_model_1 = require("../product/product.model");
const campaign_model_1 = require("./campaign.model");
const getAllCampaignsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return new QueryBuilder_1.default(campaign_model_1.CampaignModel.find().populate("products.productId", "description productInfo featuredImg"), query)
        .search(["name", "type", "status"])
        .filter()
        .sort()
        .paginate()
        .fields().modelQuery;
});
const getSingleCampaignFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield campaign_model_1.CampaignModel.findById(id).populate("products.productId", "description productInfo featuredImg");
    if (!result)
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Campaign does not exist!");
    return result;
});
const getActiveCampaignsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    return campaign_model_1.CampaignModel.find({
        status: { $in: ["scheduled", "active"] },
        startAt: { $lte: now },
        endAt: { $gte: now },
    }).populate("products.productId", "description productInfo featuredImg");
});
const validateProductsAndOverlap = (payload, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const productIds = payload.products.map((item) => item.productId);
    const products = yield product_model_1.ProductModel.find({ _id: { $in: productIds } }).select("_id productInfo.price productInfo.quantity");
    if (products.length !== productIds.length) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "One or more products do not exist!");
    }
    for (const item of payload.products) {
        const product = products.find((entry) => entry._id.toString() === item.productId.toString());
        if (!product)
            continue;
        if (item.salePrice >= product.productInfo.price) {
            throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Campaign sale price must be lower than regular price!");
        }
        if (item.stockLimit > product.productInfo.quantity) {
            throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Campaign stock cannot exceed product stock!");
        }
    }
    const overlap = yield campaign_model_1.CampaignModel.findOne({
        _id: campaignId ? { $ne: campaignId } : { $exists: true },
        status: { $in: ["scheduled", "active"] },
        startAt: { $lt: payload.endAt },
        endAt: { $gt: payload.startAt },
        "products.productId": { $in: productIds },
    });
    if (overlap) {
        throw new handleAppError_1.default(http_status_1.default.CONFLICT, "A product already has an overlapping campaign!");
    }
});
const createCampaignIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield validateProductsAndOverlap(payload);
    return campaign_model_1.CampaignModel.create(payload);
});
const updateCampaignIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield campaign_model_1.CampaignModel.findById(id);
    if (!existing)
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Campaign does not exist!");
    const merged = Object.assign(Object.assign({}, existing.toObject()), payload);
    yield validateProductsAndOverlap(merged, id);
    return campaign_model_1.CampaignModel.findByIdAndUpdate(id, payload, { new: true });
});
const updateCampaignStatusIntoDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid campaign id!");
    const result = yield campaign_model_1.CampaignModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!result)
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Campaign does not exist!");
    return result;
});
const deleteCampaignFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield campaign_model_1.CampaignModel.findByIdAndDelete(id);
    if (!result)
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Campaign does not exist!");
    return result;
});
exports.campaignServices = {
    getAllCampaignsFromDB,
    getSingleCampaignFromDB,
    getActiveCampaignsFromDB,
    createCampaignIntoDB,
    updateCampaignIntoDB,
    updateCampaignStatusIntoDB,
    deleteCampaignFromDB,
};
