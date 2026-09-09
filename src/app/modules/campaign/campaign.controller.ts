import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { campaignServices } from "./campaign.service";

const getAllCampaigns = catchAsync(async (req, res) => {
  const result = await campaignServices.getAllCampaignsFromDB(req.query);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Campaigns retrieved successfully!", data: result });
});

const getSingleCampaign = catchAsync(async (req, res) => {
  const result = await campaignServices.getSingleCampaignFromDB(req.params.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Campaign retrieved successfully!", data: result });
});

const getActiveCampaigns = catchAsync(async (_req, res) => {
  const result = await campaignServices.getActiveCampaignsFromDB();
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Active campaigns retrieved successfully!", data: result });
});

const createCampaign = catchAsync(async (req, res) => {
  const result = await campaignServices.createCampaignIntoDB(req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Campaign created successfully!", data: result });
});

const updateCampaign = catchAsync(async (req, res) => {
  const result = await campaignServices.updateCampaignIntoDB(req.params.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Campaign updated successfully!", data: result });
});

const updateCampaignStatus = catchAsync(async (req, res) => {
  const result = await campaignServices.updateCampaignStatusIntoDB(req.params.id, req.body.status);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Campaign status updated successfully!", data: result });
});

const deleteCampaign = catchAsync(async (req, res) => {
  const result = await campaignServices.deleteCampaignFromDB(req.params.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Campaign deleted successfully!", data: result });
});

export const campaignControllers = {
  getAllCampaigns,
  getSingleCampaign,
  getActiveCampaigns,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
};
