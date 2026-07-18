import express from "express";
import * as analyticsController from "./analytics.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);
// Assuming view_reports is the base permission for analytics/dashboard, as used elsewhere
router.use(authorize(Permissions.REPORTS.VIEW));

router.get("/financial/kpis", analyticsController.getKpis);
router.get("/financial/vehicles", analyticsController.getVehicleAnalytics);
router.get("/financial/drivers", analyticsController.getDriverAnalytics);
router.get("/financial/budgets", analyticsController.getBudgetAnalytics);
router.get("/financial/trends", analyticsController.getMonthlyAnalytics);
router.get("/financial/rankings", analyticsController.getRankings);

export default router;
