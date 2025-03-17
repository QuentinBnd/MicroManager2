import { Request, Response } from 'express';
import { ContractRepository } from '../repositories/ContractRepository';
import { Company } from '../entities/Company';
import { Client } from '../entities/Client';

export class ContractController {
  // Create
  static async create(req: Request, res: Response) {
    const { companyId, clientId, description, pdfUrl, startDate, endDate } = req.body;

    if (!companyId || !pdfUrl) {
      return res.status(400).json({ message: 'Les champs obligatoires sont manquants.' });
    }

    try {
      const contract = await ContractRepository.createContract({
        company: { companyId } as Company, 
        client: clientId ? ({ clientId } as Client) : undefined,
        description,
        pdfUrl,
        startDate,
        endDate,
        status: endDate && new Date(endDate) < new Date() ? 'Ended' : 'Active',
      });

      res.status(201).json({ message: 'Contrat créé avec succès', contract });
    } catch (error) {
      console.error('Erreur lors de la création du contrat :', error);
      res.status(500).json({ message: 'Erreur lors de la création du contrat.' });
    }
  }

  // Read All
  static async findAll(req: Request, res: Response) {
    const companyId = req.headers['companyid'];

    if (!companyId) {
      return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
    }

    try {
      const contracts = await ContractRepository.findAll(Number(companyId));
      res.status(200).json(contracts);
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats :', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des contrats.' });
    }
  }

  // Read One
  static async findById(req: Request, res: Response) {
    const { contractId } = req.params;

    try {
      const contract = await ContractRepository.findById(Number(contractId));

      if (!contract) {
        return res.status(404).json({ message: 'Contrat introuvable.' });
      }

      res.status(200).json(contract);
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat :', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du contrat.' });
    }
  }

  // Update
  static async update(req: Request, res: Response) {
    const { contractId } = req.params;
    const { description, pdfUrl, startDate, endDate } = req.body;

    try {
      const result = await ContractRepository.updateContract(Number(contractId), {
        description,
        pdfUrl,
        startDate,
        endDate,
        status: endDate && new Date(endDate) < new Date() ? 'Ended' : 'Active',
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Contrat introuvable.' });
      }

      res.status(200).json({ message: 'Contrat mis à jour avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat :', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du contrat.' });
    }
  }

  // Delete
  static async delete(req: Request, res: Response) {
    const { contractId } = req.params;

    try {
      const result = await ContractRepository.deleteContract(Number(contractId));

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Contrat introuvable.' });
      }

      res.status(200).json({ message: 'Contrat supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat :', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du contrat.' });
    }
  }

  // Find all contracts for a specific company
static async findByCompany(req: Request, res: Response) {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
  }

  try {
    const contracts = await ContractRepository.findAll(Number(companyId));
    if (contracts.length === 0) {
      return res.status(404).json({ message: "Aucun contrat trouvé pour cette entreprise." });
    }

    res.status(200).json(contracts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contrats.' });
  }
}
}