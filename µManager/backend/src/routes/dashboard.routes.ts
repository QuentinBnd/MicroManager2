import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/monthly-revenue/:companyId", authMiddleware, DashboardController.getMonthlyRevenue);
router.get("/ratio/:companyId", authMiddleware, DashboardController.getPaymentStatusRatio);

export default router;