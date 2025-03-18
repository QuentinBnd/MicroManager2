import { Request, Response } from "express";
import MistralAIService from "../services/MistralAIService";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { Conversation } from "../entities/Conversation";

interface AuthenticatedRequest extends Request {
    user?: {
      userId: number;
      email: string;
      name?: string;
      lastName?: string;
    };
  }

export class ChatbotController {
  
    static async sendMessage(req: AuthenticatedRequest, res: Response) {
        try {
          const { message, conversationId } = req.body;
          const userId = req.user?.userId;
          
          if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
          }

      if (!message) {
        return res.status(400).json({ error: "Le message ne peut pas être vide" });
      }

      let conversation: Conversation | null = null;
      let conversationHistory: Array<{role: string, content: string}> = [];

      // Si un ID de conversation est fourni, récupérer l'historique
      if (conversationId) {
        conversation = await ConversationRepository.findOne({ 
          where: { conversationId: parseInt(conversationId), userId }
        });
        
        if (!conversation) {
          return res.status(404).json({ error: "Conversation non trouvée" });
        }
        
        conversationHistory = conversation.messages || [];
      }

      // Le reste de la fonction reste inchangé...
      conversationHistory.push({ role: "user", content: message });
      
      const aiResponse = await MistralAIService.generateResponse(
        message, 
        conversationHistory.slice(0, -1)
      );
      
      conversationHistory.push({ role: "assistant", content: aiResponse });
      
      if (!conversation) {
        let title = message.length > 30 ? message.substring(0, 30) + "..." : message;
        
        conversation = new Conversation();
        conversation.userId = userId;
        conversation.messages = conversationHistory;
        conversation.title = title;
      } else {
        conversation.messages = conversationHistory;
      }
      
      await ConversationRepository.save(conversation);
      
      return res.status(200).json({
        response: aiResponse,
        conversationId: conversation.conversationId,
        title: conversation.title
      });
    } catch (error: any) {
        console.error("Error in chatbot:", error);
        return res.status(500).json({ error: error.message || "Une erreur est survenue" });
      }
    }
  
  // Appliquer les mêmes modifications aux autres méthodes
  static async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      const conversations = await ConversationRepository.find({
        where: { userId },
        order: { updatedAt: "DESC" }
      });
      
      return res.status(200).json(conversations.map(conv => ({
        conversationId: conv.conversationId,
        title: conv.title,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      })));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Impossible de récupérer les conversations" });
      }
    }
  
    static async getConversation(req: AuthenticatedRequest, res: Response) {
        try {
          const { id } = req.params;
          const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      const conversation = await ConversationRepository.findOne({
        where: { conversationId: parseInt(id), userId }
      });
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation non trouvée" });
      }
      
      return res.status(200).json(conversation);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return res.status(500).json({ error: "Impossible de récupérer la conversation" });
      }
    }
  
    static async deleteConversation(req: AuthenticatedRequest, res: Response) {
        try {
          const { id } = req.params;
          const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      const conversation = await ConversationRepository.findOne({
        where: { conversationId: parseInt(id), userId }
      });
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation non trouvée" });
      }
      
      await ConversationRepository.delete(conversation.conversationId);
      
      return res.status(200).json({ message: "Conversation supprimée avec succès" });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return res.status(500).json({ error: "Impossible de supprimer la conversation" });
      }
    }
}

