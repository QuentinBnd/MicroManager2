import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import { PasswordReset } from "../entities/PasswordReset";

export class PasswordResetController {
  
  static async requestReset(req: Request, res: Response) {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }
    
    try {
      // Vérifier si l'utilisateur existe
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      
      if (!user) {
        // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
        return res.status(200).json({ message: "Si l'adresse email existe, un lien de réinitialisation vous sera envoyé" });
      }
      
      // Générer un token JWT avec une durée de validité de 1 heure
      const token = jwt.sign(
        { userId: user.userId, purpose: "password_reset" },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );
      
      // Stocker le token dans la base de données
      const passwordResetRepo = AppDataSource.getRepository(PasswordReset);
      
      // Supprimer les anciens tokens pour cet utilisateur
      await passwordResetRepo.delete({ user: { userId: user.userId } });
      
      // Créer un nouveau token
      const passwordReset = new PasswordReset();
      passwordReset.token = token;
      passwordReset.user = user;
      passwordReset.expiresAt = new Date(Date.now() + 3600000); // 1 heure
      
      await passwordResetRepo.save(passwordReset);
      
      // Envoyer un email avec le lien de réinitialisation
      const resetLink = `http://localhost:5173/reset-password/${token}`;
      
      // Configuration de l'email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "micro.manager.app.but@gmail.com",
          pass: "scfi uhdw umxx mvqm"
        }
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Réinitialisation de mot de passe</title>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #4B5563;
              background-color: #F9FAFB;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #FFFFFF;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background-image: linear-gradient(to right, #3B82F6, #4F46E5);
              color: white;
              padding: 20px;
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .content {
              padding: 30px 25px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #1F2937;
            }
            .message {
              margin-bottom: 25px;
            }
            .button {
              display: inline-block;
              background-image: linear-gradient(to right, #3B82F6, #4F46E5);
              color: white;
              padding: 10px 20px;
              border-radius: 9999px;
              text-decoration: none;
              font-weight: 500;
              margin-bottom: 25px;
            }
            .footer {
              text-align: center;
              padding: 15px 25px;
              color: #9CA3AF;
              font-size: 14px;
              border-top: 1px solid #E5E7EB;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">µManager</div>
              <div>Votre gestionnaire d'entreprise</div>
            </div>
            <div class="content">
              <div class="greeting">Bonjour,</div>
              <div class="message">
                Vous avez demandé une réinitialisation de votre mot de passe pour votre compte µManager.
              </div>
              <div class="message">
                Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable pendant 1 heure.
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <div class="message">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} µManager - Tous droits réservés</p>
              <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const mailOptions = {
        from: "micro.manager.app.but@gmail.com",
        to: email,
        subject: "Réinitialisation de votre mot de passe µManager",
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      
      return res.status(200).json({ message: "Si l'adresse email existe, un lien de réinitialisation vous sera envoyé" });
      
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      return res.status(500).json({ message: "Une erreur est survenue" });
    }
  }
  
  static async verifyToken(req: Request, res: Response) {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }
    
    try {
      // Vérifier si le token existe en base et s'il n'a pas expiré
      const passwordResetRepo = AppDataSource.getRepository(PasswordReset);
      const passwordReset = await passwordResetRepo.findOne({
        where: { token },
        relations: ["user"]
      });
      
      if (!passwordReset || passwordReset.expiresAt < new Date()) {
        return res.status(400).json({ message: "Token invalide ou expiré" });
      }
      
      // Vérifier la validité du JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        if (!decoded || (decoded as any).purpose !== "password_reset") {
          return res.status(400).json({ message: "Token invalide" });
        }
      } catch (error) {
        return res.status(400).json({ message: "Token invalide" });
      }
      
      return res.status(200).json({ message: "Token valide" });
      
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return res.status(500).json({ message: "Une erreur est survenue" });
    }
  }
  
  static async resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token et mot de passe requis" });
    }
    
    try {
      // Vérifier si le token existe en base et s'il n'a pas expiré
      const passwordResetRepo = AppDataSource.getRepository(PasswordReset);
      const passwordReset = await passwordResetRepo.findOne({
        where: { token },
        relations: ["user"]
      });
      
      if (!passwordReset || passwordReset.expiresAt < new Date()) {
        return res.status(400).json({ message: "Token invalide ou expiré" });
      }
      
      // Vérifier la validité du JWT
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        if (!decoded || (decoded as any).purpose !== "password_reset") {
          return res.status(400).json({ message: "Token invalide" });
        }
      } catch (error) {
        return res.status(400).json({ message: "Token invalide" });
      }
      
      // Mettre à jour le mot de passe de l'utilisateur
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { userId: passwordReset.user.userId }
      });
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      
      await userRepository.save(user);
      
      // Supprimer le token de réinitialisation
      await passwordResetRepo.remove(passwordReset);
      
      return res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
      
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      return res.status(500).json({ message: "Une erreur est survenue" });
    }
  }
}