import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import bcrypt from "bcryptjs";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { User } from "../entities/User";

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
      await UserRepository.save(newUser);
  
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
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
    } catch (error:any) {
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
      res.status(200).json({ message: "Success",token:token , userId : user.userId });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }
}