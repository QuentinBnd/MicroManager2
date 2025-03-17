import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { InvoiceLine } from "../entities/InvoiceLine";

export class InvoiceLineController {
    static async updateInvoiceLines(req: Request, res: Response) {
        const { invoiceId } = req.params;
        const { lines } = req.body;

        try {
            const lineRepo = AppDataSource.getRepository(InvoiceLine);

            // Parcourir les lignes pour effectuer les mises à jour
            const updatedLines = await Promise.all(
                lines.map(async (line: any) => {
                    if (line.lineId) {
                        // Mettre à jour une ligne existante
                        const existingLine = await lineRepo.findOne({
                            where: { lineId: line.lineId },
                        });

                        if (existingLine) {
                            existingLine.description = line.description;
                            existingLine.quantity = parseFloat(line.quantity);
                            existingLine.unitPrice = parseFloat(line.unitPrice);
                            existingLine.totalPrice =
                                parseFloat(line.quantity) * parseFloat(line.unitPrice);
                            return lineRepo.save(existingLine);
                        }
                    } else {
                        // Créer une nouvelle ligne si elle n'existe pas
                        return lineRepo.save(
                            lineRepo.create({
                                description: line.description,
                                quantity: parseFloat(line.quantity),
                                unitPrice: parseFloat(line.unitPrice),
                                totalPrice:
                                    parseFloat(line.quantity) * parseFloat(line.unitPrice),
                                invoice: { invoiceId: parseInt(invoiceId) },
                            })
                        );
                    }
                })
            );

            res.status(200).json({
                message: "Lignes de facture mises à jour avec succès",
                updatedLines,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la mise à jour des lignes" });
        }
    }
}