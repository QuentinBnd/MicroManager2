import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/Invoice";

export class DashboardController {
    // 1. Get monthly revenue (total, paid, pending)
    static async getMonthlyRevenue(req: Request, res: Response) {
        const companyId = req.params.companyId;
        const { year, month } = req.query;

        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!year || !month) {
            return res.status(400).json({ message: "L'année et le mois sont requis." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            // Total revenu (Payés et Non Payés)
            const total = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .andWhere("MONTH(invoice.issueDate) = :month", { month })
                .getRawOne();

            // Revenus uniquement payés
            const paid = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .andWhere("MONTH(invoice.issueDate) = :month", { month })
                .andWhere("invoice.status = :status", { status: "Paid" })
                .getRawOne();

            // Revenus en attente
            const sent = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .andWhere("MONTH(invoice.issueDate) = :month", { month })
                .andWhere("invoice.status = :status", { status: "Sent" })
                .getRawOne();

            res.status(200).json({
                total: parseFloat(total.total || 0),
                paid: parseFloat(paid.total || 0),
                pending: parseFloat(sent.total || 0),
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des revenus mensuels :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des revenus mensuels." });
        }
    }

    static async getPaymentStatusRatio(req: Request, res: Response) {
        const companyId = req.params.companyId;
        const { year, month } = req.query;
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!year || !month) {
            return res.status(400).json({ message: "L'année et le mois sont requis." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            // Récupération des statuts et de leurs comptes
            const statusCounts = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("invoice.status", "status")
                .addSelect("COUNT(*)", "count")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .andWhere("MONTH(invoice.issueDate) = :month", { month })
                .groupBy("invoice.status")
                .getRawMany();
    
            // Formater les résultats pour inclure les statuts manquants avec un compte de 0
            const result: Record<'Draft' | 'Sent' | 'Paid', number> = { Draft: 0, Sent: 0, Paid: 0 };
    
            statusCounts.forEach((row) => {
                if (row.status in result) {
                    result[row.status as 'Draft' | 'Sent' | 'Paid'] = parseInt(row.count, 10);
                }
            });
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Erreur lors de la récupération du taux de paiement :", error);
            res.status(500).json({ message: "Erreur lors de la récupération du taux de paiement" });
        }
    }

}