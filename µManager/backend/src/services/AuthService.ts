import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = "Afr45z3tRgEJL908?flAq!";

export class AuthService {
  static generateToken(payload: object): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (typeof decoded === "string") {
        return null; // Si le payload est une chaîne, on retourne null
      }
      return decoded; // Retourne un JwtPayload
    } catch (error) {
      return null; // Si le token est invalide
    }
  }

  // Génère un token de réinitialisation de mot de passe (expire en 1 heure)
  static generateResetToken(userId: number): string {
    return jwt.sign({ userId, purpose: 'password_reset' }, SECRET_KEY, { expiresIn: "1h" });
  }

  // Vérifie un token de réinitialisation de mot de passe
  static verifyResetToken(token: string): { userId: number } | null {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
      if (typeof decoded === "string" || decoded.purpose !== 'password_reset') {
        return null;
      }
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}