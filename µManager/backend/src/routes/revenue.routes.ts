import { Router } from "express";
import { RevenueController } from "../controllers/RevenueController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/total", authMiddleware, RevenueController.getTotalRevenue);
router.get("/period", authMiddleware, RevenueController.getRevenueByPeriod);
router.get("/client/:clientId", authMiddleware, RevenueController.getRevenueByClient);
router.get("/compare", authMiddleware, RevenueController.compareRevenue);
router.get("/monthly", authMiddleware, RevenueController.getMonthlyRevenue);
router.get("/years", authMiddleware, RevenueController.getYearsWithRevenue);
router.get("/cumulative", authMiddleware, RevenueController.getCumulativeRevenue);
router.get("/top-clients", authMiddleware, RevenueController.getTopClients);
router.get("/payment-status", authMiddleware, RevenueController.getPaymentStatusRatio);


export default router;