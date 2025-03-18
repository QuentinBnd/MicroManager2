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

    static async sendInvoiceByEmail(req: Request, res: Response) {
        const { invoiceId } = req.params;
        const { pdfData, clientEmail, clientName } = req.body;
    
        if (!pdfData || !clientEmail) {
            return res.status(400).json({ message: 'PDF data and client email are required' });
        }
    
        try {
            // Récupérer les informations de l'entreprise à partir de la facture
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ['company'],
            });
    
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
    
            const companyName = invoice.company ? invoice.company.name : 'µManager';
    
            // Import nodemailer
            const nodemailer = require('nodemailer');
    
            // Configuration du transporteur d'email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "micro.manager.app.but@gmail.com",
                    pass: "scfi uhdw umxx mvqm"
                }
            });
    
            // Traitement des données PDF - assurons-nous qu'il s'agit de données binaires valides
            let pdfBuffer;
            try {
                // Si c'est une data URL (comme celle générée par html2canvas)
                if (pdfData.startsWith('data:')) {
                    // Extraire la partie base64 après la virgule
                    const base64Data = pdfData.split(';base64,').pop() || '';
                    pdfBuffer = Buffer.from(base64Data, 'base64');
                } else {
                    // Si c'est déjà du base64 pur
                    pdfBuffer = Buffer.from(pdfData, 'base64');
                }
            } catch (error) {
                console.error('Error processing PDF data:', error);
                return res.status(400).json({ message: 'Invalid PDF data format' });
            }
    
            // Template HTML stylisé pour le mail
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Facture #${invoiceId}</title>
                    <style>
                        body {
                            font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
                            line-height: 1.6;
                            color: #4B5563;
                            background-color: #F9FAFB;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: #FFFFFF;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        }
                        .header {
                            background-image: linear-gradient(to right, #3B82F6, #4F46E5);
                            color: white;
                            padding: 20px;
                            text-align: center;
                        }
                        .logo {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .content {
                            padding: 30px 25px;
                        }
                        .greeting {
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 15px;
                            color: #1F2937;
                        }
                        .message {
                            margin-bottom: 25px;
                        }
                        .invoice-details {
                            background-color: #F3F4F6;
                            border-radius: 6px;
                            padding: 15px;
                            margin-bottom: 25px;
                        }
                        .invoice-number {
                            font-weight: 600;
                            color: #1F2937;
                        }
                        .company-info {
                            font-weight: 600;
                            color: #1F2937;
                        }
                        .button {
                            display: inline-block;
                            background-image: linear-gradient(to right, #3B82F6, #4F46E5);
                            color: white;
                            padding: 10px 20px;
                            border-radius: 9999px;
                            text-decoration: none;
                            font-weight: 500;
                            margin-bottom: 25px;
                        }
                        .footer {
                            text-align: center;
                            padding: 15px 25px;
                            color: #9CA3AF;
                            font-size: 14px;
                            border-top: 1px solid #E5E7EB;
                        }
                    </style>
                </head>
                <body>
                <div class="container">
                    <div class="header">
                    <div class="logo">µManager</div>
                    <div>Votre gestionnaire d'entreprise</div>
                    </div>
                    <div class="content">
                    <div class="greeting">Bonjour ${clientName},</div>
                    <div class="message">
                        Nous espérons que vous vous portez bien. Vous trouverez ci-joint votre facture n° ${invoiceId}.
                    </div>
                    <div class="invoice-details">
                        <p><span class="invoice-number">Facture n° ${invoiceId}</span></p>
                        <p>Cette facture a été générée automatiquement via l'application µManager.</p>
                        <p><span class="company-info">Émise par : ${companyName}</span></p>
                    </div>
                    <div class="message">
                        Pour toute question concernant cette facture, n'hésitez pas à contacter directement ${companyName} qui l'a émise.
                    </div>
                    <div class="message">
                        Nous vous remercions de votre confiance.
                    </div>
                    </div>
                    <div class="footer">
                    <p>© ${new Date().getFullYear()} µManager - Tous droits réservés</p>
                    <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </div>
                </body>
                </html>
            `;
    
            const mailOptions = {
                from: "micro.manager.app.but@gmail.com",
                to: "quentinn.bernardd@gmail.com", // Adresse email de test pour les tests
                subject: `Facture #${invoiceId} - ${companyName}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `facture_${invoiceId}.png`, // Correction de l'extension
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };
    
            await transporter.sendMail(mailOptions);
    
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({
                message: 'Error sending email',
                error: (error as Error).message
            });
        }
    }
}