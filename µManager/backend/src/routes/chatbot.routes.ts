import express from "express";
import { ChatbotController } from "../controllers/ChatbotController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Toutes nos routes de chatbot nécessitent une authentification
router.use(authMiddleware);

// Routes pour les conversations avec le chatbot
router.post("/message", ChatbotController.sendMessage);
router.get("/conversations", ChatbotController.getConversations);
router.get("/conversations/:id", ChatbotController.getConversation);
router.delete("/conversations/:id", ChatbotController.deleteConversation);

export default router;