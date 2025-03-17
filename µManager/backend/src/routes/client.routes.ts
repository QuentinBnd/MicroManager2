import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/",authMiddleware, ClientController.createClient);
router.get("/", authMiddleware,ClientController.getClients);
router.get("/:id",authMiddleware, ClientController.getClientById);
router.put("/:id", authMiddleware, ClientController.updateClient);
router.delete("/:id",authMiddleware, ClientController.deleteClient);
router.get("/company/:companyId", ClientController.getClientsByCompany);

export default router;