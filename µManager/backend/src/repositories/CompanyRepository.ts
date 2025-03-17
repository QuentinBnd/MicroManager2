import { AppDataSource } from "../config/data-source";
import { Company } from "../entities/Company";

export const CompanyRepository = AppDataSource.getRepository(Company);