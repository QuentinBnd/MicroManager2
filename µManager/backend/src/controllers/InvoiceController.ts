import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Invoice } from '../entities/Invoice';
import { InvoiceLine } from '../entities/InvoiceLine';
import * as nodemailer from "nodemailer";

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

    // Ajouter cette méthode à la classe InvoiceController

    static async getOverdueInvoices(req: Request, res: Response) {
        const companyId = req.params.companyId;

        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            // Récupérer toutes les factures avec statut "Sent" (envoyées mais non payées)
            const overdueInvoices = await invoiceRepo
                .createQueryBuilder("invoice")
                .innerJoinAndSelect("invoice.client", "client")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("invoice.status = :status", { status: "Sent" })
                .orderBy("invoice.issueDate", "ASC")
                .getMany();

            // Calculer le nombre de jours depuis l'émission pour chaque facture
            const today = new Date();
            const invoicesWithDays = overdueInvoices.map(invoice => {
                const issueDate = new Date(invoice.issueDate);
                const daysOverdue = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    ...invoice,
                    daysOverdue: daysOverdue,
                    isLate: daysOverdue > 45 // En France, délai légal de 45 jours
                };
            });

            res.status(200).json(invoicesWithDays);
        } catch (error) {
            console.error('Error fetching overdue invoices:', error);
            res.status(500).json({
                message: 'Error fetching overdue invoices',
                error: (error as Error).message
            });
        }
    }

    // Ajouter cette méthode à la classe InvoiceController

    static async sendReminderEmail(req: Request, res: Response) {
        const { invoiceId } = req.params;
        const { daysOverdue } = req.body;
    
        try {
            // Récupérer les informations de la facture
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoice = await invoiceRepo.findOne({
                where: { invoiceId: parseInt(invoiceId) },
                relations: ['client', 'company'],
            });
    
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
    
            if (invoice.status !== "Sent") {
                return res.status(400).json({ message: 'Only unpaid invoices can receive reminders' });
            }
    
            // Vérifier si un rappel a été envoyé dans les dernières 48h
            if (invoice.lastReminderDate) {
                const lastReminder = new Date(invoice.lastReminderDate);
                const now = new Date();
                const hoursSinceLastReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60);
                
                if (hoursSinceLastReminder < 48) {
                    return res.status(429).json({ 
                        message: 'Un rappel a déjà été envoyé récemment. Veuillez attendre 48h entre deux rappels.' 
                    });
                }
            }
    
            const clientName = `${invoice.client.name} ${invoice.client.lastName}`;
            const clientEmail = invoice.client.email;
            const companyName = invoice.company.name;
    
            // Conversion explicite en nombre pour résoudre l'erreur
            const invoiceTotal = typeof invoice.total === 'number'
                ? invoice.total.toFixed(2)
                : parseFloat(String(invoice.total)).toFixed(2);
    
            const issueDate = new Date(invoice.issueDate).toLocaleDateString('fr-FR');
            const isLate = daysOverdue > 45;
    
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
    
            // Template HTML complet pour le mail de rappel
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Rappel de facture #${invoiceId}</title>
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
                    .late-notice {
                        background-color: ${isLate ? '#FEE2E2' : '#FEF3C7'};
                        border-left: 4px solid ${isLate ? '#EF4444' : '#F59E0B'};
                        color: ${isLate ? '#B91C1C' : '#92400E'};
                        padding: 10px 15px;
                        margin-bottom: 25px;
                        font-weight: 500;
                        border-radius: 4px;
                    }
                    .penalties-notice {
                        background-color: #EFF6FF;
                        border-left: 4px solid #2563EB;
                        color: #1E40AF;
                        padding: 10px 15px;
                        margin-bottom: 25px;
                        font-size: 14px;
                        border-radius: 4px;
                    }
                    .footer {
                        text-align: center;
                        padding: 15px 25px;
                        color: #9CA3AF;
                        font-size: 14px;
                        border-top: 1px solid #E5E7EB;
                    }
                    .button {
                        display: inline-block;
                        background-image: linear-gradient(to right, #3B82F6, #4F46E5);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 9999px;
                        text-decoration: none;
                        font-weight: 500;
                        margin-top: 15px;
                    }
                    </style>
                </head>
                <body>
                <div class="container">
                    <div class="header">
                    <div class="logo">µManager</div>
                    <div>Rappel de facture</div>
                    </div>
                    <div class="content">
                    <div class="greeting">Bonjour ${clientName},</div>
                    
                    <div class="message">
                        Nous espérons que ce message vous trouve bien. Nous vous contactons au sujet de la facture n° ${invoiceId} émise le ${issueDate}, qui reste en attente de paiement.
                    </div>
                    
                    <div class="late-notice">
                        ${isLate ?
                    `Cette facture a dépassé le délai légal de paiement de 45 jours et est en retard de ${daysOverdue} jours.` :
                    `Cette facture est en attente de paiement depuis ${daysOverdue} jours (le délai légal en France est de 45 jours).`
                }
                    </div>
                    
                    ${isLate ? `
                    <div class="penalties-notice">
                        <p><strong>Pénalités applicables en cas de non-paiement :</strong></p>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Des intérêts de retard calculés à un taux de 10 fois le taux d'intérêt légal</li>
                            <li>Une indemnité forfaitaire de recouvrement de 40 euros (art. L441-10, Code de commerce)</li>
                        </ul>
                        <p style="margin-top: 8px; margin-bottom: 0;">Ces pénalités sont applicables de plein droit, sans préavis, conformément à la loi n° 2012-387 du 22 mars 2012.</p>
                    </div>
                    ` : ''}
                    
                    <div class="invoice-details">
                        <p><span class="invoice-number">Facture n° ${invoiceId}</span></p>
                        <p>Montant total: ${invoiceTotal} €</p>
                        <p>Date d'émission: ${issueDate}</p>
                        <p>En attente depuis: ${daysOverdue} jours</p>
                        <p><span class="company-info">Émise par: ${companyName}</span></p>
                    </div>
                    
                    <div class="message">
                        Nous vous serions reconnaissants de bien vouloir procéder au règlement de cette facture dans les meilleurs délais.
                    </div>
                    
                    <div class="message">
                        Si le paiement a déjà été effectué, veuillez nous en informer afin que nous puissions mettre à jour nos registres.
                    </div>
                    
                    <div class="message">
                        Pour toute question concernant cette facture, n'hésitez pas à nous contacter.
                    </div>
                    
                    <div class="message">
                        Nous vous remercions de votre attention et de votre collaboration.
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
    
            // Options du mail - utiliser l'adresse de test pendant le développement
            const mailOptions = {
                from: "micro.manager.app.but@gmail.com",
                to: process.env.NODE_ENV === 'production' ? clientEmail : "quentinn.bernardd@gmail.com",
                subject: `Rappel de facture #${invoiceId} - ${companyName}`,
                html: htmlContent,
            };
    
            await transporter.sendMail(mailOptions);
            
            // Mise à jour de la date du dernier rappel
            invoice.lastReminderDate = new Date();
            await invoiceRepo.save(invoice);
    
            // Renvoyer la date du dernier rappel pour mise à jour dans le frontend
            res.status(200).json({ 
                message: 'Reminder email sent successfully',
                lastReminderDate: invoice.lastReminderDate
            });
        } catch (error) {
            console.error('Error sending reminder email:', error);
            res.status(500).json({
                message: 'Error sending reminder email',
                error: (error as Error).message
            });
        }
    }
}