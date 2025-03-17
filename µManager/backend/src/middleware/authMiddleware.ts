import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    res.status(401).json({ message: "Invalid token." });
    return;
  }

  // Utilisation d'une assertion de type pour éviter les erreurs de typage
  (req as any).user = decoded;
  next();
};