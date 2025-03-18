import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { rawListeners } from "process";
import { PasswordResetController } from "../controllers/PasswordResetController";

const router = Router();

router.post("/login", UserController.login);

// Routes pour la réinitialisation de mot de passe
router.post("/forgot-password", PasswordResetController.requestReset);
router.get("/verify-reset-token/:token", PasswordResetController.verifyToken);
router.post("/reset-password/:token", PasswordResetController.resetPassword);


router.get("/", authMiddleware, UserController.getAllUsers);
router.get("/:id", authMiddleware, UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", authMiddleware, UserController.updateUser);
router.delete("/:id", authMiddleware, UserController.deleteUser);

export default router;