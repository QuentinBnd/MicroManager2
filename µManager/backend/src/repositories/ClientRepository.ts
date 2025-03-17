import { AppDataSource } from "../config/data-source";
import { Client } from "../entities/Client";

export const ClientRepository = AppDataSource.getRepository(Client);