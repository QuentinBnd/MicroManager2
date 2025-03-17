import { Request, Response } from "express";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { UserRepository } from "../repositories/UserRepository";

export class CompanyController {
  static async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await CompanyRepository.find({
        relations: ["user"],
      });
      res.status(200).json(companies);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  static async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await CompanyRepository.findOne({
        where: { companyId: parseInt(id) },
        relations: ["user"],
      });
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  static async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const { userId, name, address, city, postalCode, phone, email, rib, siret } = req.body;

      const user = await UserRepository.findOneBy({ userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const newCompany = CompanyRepository.create({
        name,
        address,
        city,
        postalCode,
        phone,
        email,
        rib,
        user,
        siret,
      });
      await CompanyRepository.save(newCompany);

      res.status(201).json({ message: "Success", companyId: newCompany.companyId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  static async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, address, city, postalCode,phone,email,rib, siret } = req.body;

      const company = await CompanyRepository.findOneBy({ companyId: parseInt(id) });
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      company.name = name || company.name;
      company.address = address || company.address;
      company.city = city || company.city;
      company.postalCode = postalCode || company.postalCode;
      company.phone = phone || company.phone;
      company.email = email || company.email;
      company.rib = rib || company.rib;
      company.siret = siret || company.siret;
      await CompanyRepository.save(company);

      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  static async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const company = await CompanyRepository.findOneBy({ companyId: parseInt(id) });
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      await CompanyRepository.remove(company);
      res.status(200).send({ message: "Success"});
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
}