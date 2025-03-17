import { Request, Response } from "express";
import { Client } from "../entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";

export class ClientController {
  static async createClient(req: Request, res: Response) {
    try {
      const { clientRib, clientCompany, name, lastName, email, phone, address, companyId } = req.body;

      //check if company exists
      const existingCompany = await CompanyRepository.findOneBy({ companyId });
      if (!existingCompany) {
        return res.status(400).json({ message: "Company does not exist" });
      }
      // check if that company already has a client with the same clientCompany
        const existingClient = await ClientRepository.findOneBy({ clientCompany, company: { companyId } });
        if (existingClient) {
          return res.status(400).json({ message: "Client already exists" });
        }


      const newClient = ClientRepository.create({
        clientRib,
        clientCompany,
        name,
        lastName,
        email,
        phone,
        address,
        company: { companyId }, // Liaison avec la société
      });

      const savedClient = await ClientRepository.save(newClient);
      res.status(201).json(savedClient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClients(req: Request, res: Response) {
    try {
      const clients = await ClientRepository.find({ relations: ["company"] });
      res.status(200).json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientRepository.findOne({ where: { clientId: parseInt(id) }, relations: ["company"] });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.status(200).json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientRepository.findOneBy({ clientId: parseInt(id) });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const updates = Object.fromEntries(
        Object.entries(req.body).filter(
          ([key, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      ClientRepository.merge(client, updates);
      const updatedClient = await ClientRepository.save(client);

      res.status(200).json(updatedClient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientRepository.findOneBy({ clientId: parseInt(id) });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await ClientRepository.remove(client);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClientsByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
  
      const clients = await ClientRepository.find({
        where: { company: { companyId: parseInt(companyId) } },
        relations: ["company"],
      });
  
      if (!clients || clients.length === 0) {
        return res.status(404).json({ message: "No clients found for this company" });
      }
  
      res.status(200).json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}