import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import bcrypt from "bcryptjs";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { User } from "../entities/User";
import * as nodemailer from "nodemailer";


export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserRepository.find();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findOneBy({ userId: parseInt(id) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, lastName, password } = req.body;
  
      // Convertit les données brutes en une instance de l'entité User
      const newUser = plainToClass(User, { email, name, lastName, password });
  
      // Valide les données
      const errors = await validate(newUser);
      if (errors.length > 0) {
        res.status(400).json(errors);
        return;
      }
  
      // Vérifie si l'email existe déjà
      const existingUser = await UserRepository.findOneBy({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email is already in use" });
        return;
      }
  
      // Hache le mot de passe et sauvegarde l'utilisateur
      newUser.password = await bcrypt.hash(password, 10);
      const savedUser = await UserRepository.save(newUser);
      
      // IMPORTANT: D'abord envoyer la réponse pour ne pas bloquer l'inscription
      res.status(201).json(savedUser);
      
      // PUIS tenter d'envoyer l'email en arrière-plan
      // Cette partie s'exécute après que la réponse HTTP a été envoyée
      setTimeout(() => {
        // Utiliser le nom de la classe directement au lieu de this
        UserController.sendWelcomeEmail(email, name, lastName)
          .catch(err => {
            console.error("Erreur lors de l'envoi de l'email:", err);
          });
      }, 0);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  private static async sendWelcomeEmail(email: string, firstName: string, lastName: string) {
    try {
      // Configuration du transporteur reste inchangée
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "micro.manager.app.but@gmail.com",
          pass: "scfi uhdw umxx mvqm"
        }
      });

      const currentYear = new Date().getFullYear();

      // Template HTML pour l'email de bienvenue
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Bienvenue sur µManager</title>
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
                .footer {
                    text-align: center;
                    padding: 15px 25px;
                    color: #9CA3AF;
                    font-size: 14px;
                    border-top: 1px solid #E5E7EB;
                }
                .button {
                    display: inline-block;
                    background-image: linear-gradient(to right, #3B82F6, #4F46E5);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 9999px;
                    text-decoration: none;
                    font-weight: 500;
                    margin-top: 15px;
                }
                .steps {
                    background-color: #F3F4F6;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 25px;
                }
                .step {
                    margin-bottom: 10px;
                }
                .step-number {
                    display: inline-block;
                    width: 24px;
                    height: 24px;
                    background-color: #4F46E5;
                    color: white;
                    border-radius: 50%;
                    text-align: center;
                    font-weight: bold;
                    margin-right: 10px;
                }
            </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
                <div class="logo">µManager</div>
                <div>Votre solution de gestion d'entreprise</div>
            </div>
            <div class="content">
                <div class="greeting">Bonjour ${firstName} ${lastName},</div>
                
                <div class="message">
                    Merci de vous être inscrit sur µManager, votre nouvelle solution pour simplifier la gestion de votre micro-entreprise.
                </div>
                
                <div class="message">
                    Votre compte a été créé avec succès et vous pouvez dès maintenant commencer à utiliser toutes les fonctionnalités de notre application.
                </div>
                
                <div class="steps">
                    <p><strong>Premiers pas avec µManager :</strong></p>
                    <div class="step"><span class="step-number">1</span> Créez votre entreprise</div>
                    <div class="step"><span class="step-number">2</span> Ajoutez vos premiers clients</div>
                    <div class="step"><span class="step-number">3</span> Commencez à créer des factures et des contrats</div>
                    <div class="step"><span class="step-number">4</span> Suivez vos revenus depuis votre tableau de bord</div>
                </div>
                
                <div class="message">
                    Si vous avez des questions ou besoin d'aide pour démarrer, n'hésitez pas à consulter notre documentation ou à nous contacter.
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="http://localhost:5173/login" class="button" style="color: white !important;">Accéder à mon compte</a>
                </div>
            </div>
            
            <div class="footer">
                <p>© ${currentYear} µManager - Tous droits réservés</p>
                <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: "micro.manager.app.but@gmail.com",
        to: 'quentinn.bernardd@gmail.com', // Utiliser l'email passé en paramètre au lieu de l'adresse codée en dur
        subject: "Bienvenue sur µManager !",
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      console.log("Email de bienvenue envoyé avec succès à:", email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
      // Ne pas bloquer le processus d'inscription si l'email échoue
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Trouver l'utilisateur existant
      const user = await UserRepository.findOneBy({ userId: parseInt(id) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Filtrer les champs vides dans req.body
      const updates = Object.fromEntries(
        Object.entries(req.body).filter(
          ([key, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      // Ne pas modifier si aucun champ valide n'est fourni
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      // Vérifier si un mot de passe est fourni pour le hacher
      if (typeof updates.password === "string" && updates.password.trim() !== "") {
        const salt = await bcrypt.genSalt(10); // Générer un sel
        updates.password = await bcrypt.hash(updates.password, salt); // Hacher le mot de passe
      }

      // Appliquer les mises à jour filtrées à l'utilisateur existant
      UserRepository.merge(user, updates);

      // Sauvegarder les modifications dans la base de données
      const updatedUser = await UserRepository.save(user);

      // Retourner l'utilisateur mis à jour
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findOneBy({ userId: parseInt(id) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await UserRepository.remove(user);
      res.status(200).send({ message: 'User deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // AUTH 

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log('received password', password)

      const user = await UserRepository.findOneBy({ email });
      if (!user) {
        console.log('No user found')
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Password not valid')
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = AuthService.generateToken({ userId: user.userId });
      res.status(200).json({ message: "Success", token: token, userId: user.userId });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }
}