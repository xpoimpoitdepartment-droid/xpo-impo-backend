import { dashboardControllers } from "./dashboard.controller";
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { dashboardValidation } from "./dashboard.validations";

import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/user", auth("customer", "admin", "vendor", "user" as any), dashboardControllers.getUserDashboardStats);

router.post(
  "/",
  validateRequest(dashboardValidation),
  dashboardControllers.createDashboard
);
router.get("/", dashboardControllers.getAllDashboards);
// router.get("/:id", dashboardControllers.getDashboardById);
// router.patch(
//   "/:id",
//   validateRequest(dashboardValidation.partial()),
//   dashboardControllers.updateDashboard
// );
// router.delete("/:id", dashboardControllers.deleteDashboard);

export const DashboardRoutes = router;
