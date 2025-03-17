import { Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, CompanyController.getAllCompanies);
router.get("/:id", authMiddleware, CompanyController.getCompanyById);
router.post("/", authMiddleware, CompanyController.createCompany);
router.put("/:id", authMiddleware, CompanyController.updateCompany);
router.delete("/:id", authMiddleware, CompanyController.deleteCompany);

export default router;