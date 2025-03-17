import jwt, { JwtPayload } from "jsonwebtoken";

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
}