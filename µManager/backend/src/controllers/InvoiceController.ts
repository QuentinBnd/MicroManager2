import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Invoice } from '../entities/Invoice';
import { InvoiceLine } from '../entities/InvoiceLine';

// Définir un type pour les lignes
interface InvoiceLinePayload {
    lineId?: number; // Optionnel pour les nouvelles lignes
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number; // Calculé si non fourni
}

export class InvoiceController {
    // Créer une nouvelle facture
    static async createInvoice(req: Request, res: Response) {
        const { clientId, companyId, lines, issueDate, dueDate, status } = req.body;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const lineRepo = AppDataSource.getRepository(InvoiceLine);

            // Calculer le total
            const total = lines?.reduce(
                (sum: number, line: InvoiceLinePayload) =>
                    sum + line.quantity * line.unitPrice,
                0,
            );

            // Créer la facture
            const invoice = invoiceRepo.create({
                client: { clientId },
                company: { companyId },
                issueDate,
                dueDate,
                status,
                total,
            });

            await invoiceRepo.save(invoice);

            // Créer et enregistrer les lignes de facture
            if (lines && lines.length > 0) {
                const invoiceLines = lines.map((line: InvoiceLinePayload) =>
                    lineRepo.create({
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        totalPrice: line.quantity * line.unitPrice,
                        invoice,
                    }),
                );
                await lineRepo.save(invoiceLines);
            }

            res.status(201).json({ message: 'Invoice created successfully', invoice });
        } catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({ message: 'Error creating invoice', error: (error as Error).message });
        }
    }

    // Récupérer toutes les factures
    static async getAllInvoices(req: Request, res: Response) {
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoices = await invoiceRepo.find({
                relations: ['lines', 'client', 'company'],
            });

            res.status(200).json(invoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            res.status(500).json({ message: 'Error fetching invoices', error: (error as Error).message });
        }
    }

    // Récupérer une facture par ID
    static async getInvoiceById(req: Request, res: Response) {
        const { invoiceId } = req.params;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ['lines', 'client', 'company'],
            });

            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }

            res.status(200).json(invoice);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            res.status(500).json({ message: 'Error fetching invoice', error: (error as Error).message });
        }
    }

    // Mettre à jour une facture
    static async updateInvoice(req: Request, res: Response) {
        const { invoiceId } = req.params;
        const { clientId, lines, issueDate, dueDate, status, total } = req.body;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const lineRepo = AppDataSource.getRepository(InvoiceLine);

            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ["lines"],
            });

            if (!invoice) {
                return res.status(404).json({ message: "Facture introuvable" });
            }

            // Mettre à jour uniquement les champs fournis
            if (clientId !== undefined) invoice.client = { clientId } as any;
            if (issueDate !== undefined) invoice.issueDate = issueDate;
            if (dueDate !== undefined) invoice.dueDate = dueDate;
            if (status !== undefined) invoice.status = status;
            if (total !== undefined) invoice.total = total;

            if (lines !== undefined) {
                const existingLineIds = invoice.lines.map((line) => line.lineId);
                const incomingLineIds = lines.map((line: InvoiceLinePayload) => line.lineId).filter(Boolean);

                // Supprimer les lignes non incluses dans la mise à jour
                const linesToDelete = existingLineIds.filter((id) => !incomingLineIds.includes(id));
                if (linesToDelete.length) {
                    await lineRepo.delete(linesToDelete);
                }

                // Ajouter ou mettre à jour les lignes
                const updatedLines = lines.map((line: InvoiceLinePayload) => {
                    if (line.lineId) {
                        return lineRepo.create({
                            lineId: line.lineId,
                            description: line.description,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,
                            totalPrice: line.totalPrice || line.quantity * line.unitPrice,
                            invoice,
                        });
                    } else {
                        return lineRepo.create({
                            description: line.description,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,
                            totalPrice: line.totalPrice || line.quantity * line.unitPrice,
                            invoice,
                        });
                    }
                });

                await lineRepo.save(updatedLines);
            }

            await invoiceRepo.save(invoice);

            res.status(200).json({ message: "Facture mise à jour avec succès", invoice });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la mise à jour de la facture" });
        }
    }

    // Mettre à jour uniquement les lignes
    static async updateInvoiceLines(req: Request, res: Response) {
        const { invoiceId } = req.params;
        const { lines } = req.body;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const lineRepo = AppDataSource.getRepository(InvoiceLine);

            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ["lines"],
            });

            if (!invoice) {
                return res.status(404).json({ message: "Facture introuvable" });
            }

            const existingLineIds = invoice.lines.map((line) => line.lineId);
            const incomingLineIds = lines.map((line: InvoiceLinePayload) => line.lineId).filter(Boolean);

            // Supprimer les lignes non incluses
            const linesToDelete = existingLineIds.filter((id) => !incomingLineIds.includes(id));
            if (linesToDelete.length > 0) {
                await lineRepo.delete(linesToDelete);
            }

            // Ajouter ou mettre à jour les lignes
            const updatedLines = lines.map((line: InvoiceLinePayload) => {
                if (line.lineId) {
                    return lineRepo.create({
                        lineId: line.lineId,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        totalPrice: line.totalPrice || line.quantity * line.unitPrice,
                        invoice,
                    });
                } else {
                    return lineRepo.create({
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        totalPrice: line.totalPrice || line.quantity * line.unitPrice,
                        invoice,
                    });
                }
            });

            await lineRepo.save(updatedLines);

            res.status(200).json({ message: "Lignes mises à jour avec succès", updatedLines });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des lignes :", error);
            res.status(500).json({ message: "Erreur lors de la mise à jour des lignes" });
        }
    }

    // Supprimer une facture
    static async deleteInvoice(req: Request, res: Response) {
        const { invoiceId } = req.params;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ['lines'],
            });

            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }

            await invoiceRepo.remove(invoice);

            res.status(200).json({ message: 'Invoice deleted successfully' });
        } catch (error) {
            console.error('Error deleting invoice:', error);
            res.status(500).json({ message: 'Error deleting invoice', error: (error as Error).message });
        }
    }

    static async getInvoicesByCompanyId(req: Request, res: Response) {
        const { companyId } = req.params;

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoices = await invoiceRepo.find({
                where: { company: { companyId: parseInt(companyId) } },
                relations: ["client", "lines"], // Fetch related entities
            });

            if (!invoices.length) {
                return res
                    .status(404)
                    .json({ message: "No invoices found for this company" });
            }

            res.status(200).json(invoices);
        } catch (error) {
            console.error("Error fetching invoices by company ID:", error);
            res.status(500).json({
                message: "Error fetching invoices by company ID",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}