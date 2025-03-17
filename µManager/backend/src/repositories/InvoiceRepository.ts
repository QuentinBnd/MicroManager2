import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/Invoice";

export const InvoiceRepository = AppDataSource.getRepository(Invoice);
