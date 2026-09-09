import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { campaignControllers } from "./campaign.controller";
import { createCampaignSchema, updateCampaignStatusSchema } from "./campaign.validation";

const router = express.Router();

router.get("/", campaignControllers.getAllCampaigns);
router.get("/active", campaignControllers.getActiveCampaigns);
router.get("/:id", campaignControllers.getSingleCampaign);
router.post("/create", validateRequest(createCampaignSchema), campaignControllers.createCampaign);
router.patch("/:id", validateRequest(createCampaignSchema.partial()), campaignControllers.updateCampaign);
router.patch("/:id/status", validateRequest(updateCampaignStatusSchema), campaignControllers.updateCampaignStatus);
router.delete("/:id", campaignControllers.deleteCampaign);

export const CampaignRoutes = router;
