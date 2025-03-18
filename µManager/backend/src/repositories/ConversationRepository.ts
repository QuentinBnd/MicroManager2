import { AppDataSource } from "../config/data-source";
import { Conversation } from "../entities/Conversation";

export const ConversationRepository = AppDataSource.getRepository(Conversation);