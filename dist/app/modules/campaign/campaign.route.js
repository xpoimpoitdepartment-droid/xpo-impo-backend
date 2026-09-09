"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const campaign_controller_1 = require("./campaign.controller");
const campaign_validation_1 = require("./campaign.validation");
const router = express_1.default.Router();
router.get("/", campaign_controller_1.campaignControllers.getAllCampaigns);
router.get("/active", campaign_controller_1.campaignControllers.getActiveCampaigns);
router.get("/:id", campaign_controller_1.campaignControllers.getSingleCampaign);
router.post("/create", (0, validateRequest_1.default)(campaign_validation_1.createCampaignSchema), campaign_controller_1.campaignControllers.createCampaign);
router.patch("/:id", (0, validateRequest_1.default)(campaign_validation_1.createCampaignSchema.partial()), campaign_controller_1.campaignControllers.updateCampaign);
router.patch("/:id/status", (0, validateRequest_1.default)(campaign_validation_1.updateCampaignStatusSchema), campaign_controller_1.campaignControllers.updateCampaignStatus);
router.delete("/:id", campaign_controller_1.campaignControllers.deleteCampaign);
exports.CampaignRoutes = router;
