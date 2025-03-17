import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/Invoice";
import { Client } from "../entities/Client";


export class RevenueController {
    // 1. Get total revenue for a company
    static async getTotalRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"];

        if (!companyId || typeof companyId !== "string") {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            const totalRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .getRawOne();

            res.status(200).json({ totalRevenue: parseFloat(totalRevenue.total || 0).toFixed(2) });
        } catch (error) {
            console.error("Error fetching total revenue:", error);
            res.status(500).json({ message: "Erreur lors du calcul du CA total" });
        }
    }

    // 2. Get revenue for a specific period for a company
    static async getRevenueByPeriod(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (!companyId || typeof companyId !== "string") {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Les dates de début et de fin sont requises." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            const revenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("invoice.issueDate BETWEEN :startDate AND :endDate", { startDate, endDate })
                .getRawOne();

            res.status(200).json({ revenue: parseFloat(revenue.total || 0).toFixed(2) });
        } catch (error) {
            console.error("Error fetching revenue by period:", error);
            res.status(500).json({ message: "Erreur lors du calcul du CA pour la période donnée" });
        }
    }

    // 3. Get revenue by client for a company
    static async getRevenueByClient(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
        const clientId = req.params.clientId;

        if (!companyId || typeof companyId !== "string") {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!clientId) {
            return res.status(400).json({ message: "L'ID du client est requis." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            const revenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("invoice.client = :clientId", { clientId })
                .getRawOne();

            res.status(200).json({ revenue: parseFloat(revenue.total || 0).toFixed(2) });
        } catch (error) {
            console.error("Error fetching revenue by client:", error);
            res.status(500).json({ message: "Erreur lors du calcul du CA pour le client" });
        }
    }

    // 4. Compare revenue between years for a company
    static async compareRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
        const year = req.query.year as string;

        if (!companyId || typeof companyId !== "string") {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!year || isNaN(parseInt(year))) {
            return res.status(400).json({ message: "L'année est invalide ou manquante." });
        }

        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);

            const currentYearRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .getRawOne();

            const previousYearRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year: (parseInt(year) - 1).toString() })
                .getRawOne();

            res.status(200).json({
                currentYearRevenue: parseFloat(currentYearRevenue.total || 0).toFixed(2),
                previousYearRevenue: parseFloat(previousYearRevenue.total || 0).toFixed(2),
            });
        } catch (error) {
            console.error("Error comparing revenue:", error);
            res.status(500).json({ message: "Erreur lors de la comparaison du CA entre les années" });
        }
    }

    static async getMonthlyRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"]; // Company ID from headers
        const { year } = req.query; // Year from query parameters
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!year) {
            return res.status(400).json({ message: "L'année est requise." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            // Query to calculate monthly revenue
            const monthlyRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("MONTH(invoice.issueDate)", "month")
                .addSelect("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .groupBy("MONTH(invoice.issueDate)")
                .orderBy("MONTH(invoice.issueDate)")
                .getRawMany();
    
            // Create an array with 12 months (default 0 revenue)
            const revenueByMonth = Array(12).fill(0);
            monthlyRevenue.forEach((row) => {
                revenueByMonth[parseInt(row.month) - 1] = parseFloat(row.total);
            });
    
            res.status(200).json({ revenueByMonth });
        } catch (error) {
            console.error("Erreur lors du calcul des revenus mensuels :", error);
            res.status(500).json({ message: "Erreur lors du calcul des revenus mensuels" });
        }
    }

    static async getYearsWithRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"]; // Assume `companyId` is sent in headers
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            const yearsWithRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("DISTINCT YEAR(invoice.issueDate)", "year")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("invoice.status = :status", { status: "Paid" })
                .orderBy("year", "DESC")
                .getRawMany();
    
            const years = yearsWithRevenue.map((entry) => entry.year);
    
            res.status(200).json({ years });
        } catch (error) {
            console.error("Erreur lors de la récupération des années :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des années." });
        }
    }

    static async getCumulativeRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
        const { year } = req.query;
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
        if (!year) {
            return res.status(400).json({ message: "L'année est requise." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            const cumulativeRevenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("MONTH(invoice.issueDate)", "month")
                .addSelect("SUM(invoice.total)", "total")
                .where("invoice.status = :status", { status: "Paid" })
                .andWhere("invoice.company = :companyId", { companyId })
                .andWhere("YEAR(invoice.issueDate) = :year", { year })
                .groupBy("MONTH(invoice.issueDate)")
                .orderBy("MONTH(invoice.issueDate)")
                .getRawMany();
    
            const data = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: 0,
            }));
    
            cumulativeRevenue.forEach((row) => {
                data[row.month - 1].total = parseFloat(row.total);
            });
    
            let cumulativeTotal = 0;
            const result = data.map((row) => {
                cumulativeTotal += row.total;
                return { month: row.month, total: cumulativeTotal };
            });
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Erreur lors de la récupération des revenus cumulés :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des revenus cumulés" });
        }
    }

        static async getTopClients(req: Request, res: Response) {
            const companyId = req.headers["companyid"];
    
            if (!companyId) {
                return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
            }
    
            try {
                const invoiceRepo = AppDataSource.getRepository(Invoice);
                const clientRepo = AppDataSource.getRepository(Client);
    
                const topClients = await invoiceRepo
                    .createQueryBuilder("invoice")
                    .select("invoice.client", "clientId")
                    .addSelect("SUM(invoice.total)", "total")
                    .where("invoice.status = :status", { status: "Paid" })
                    .andWhere("invoice.company = :companyId", { companyId })
                    .groupBy("invoice.client")
                    .orderBy("SUM(invoice.total)", "DESC")
                    .limit(5)
                    .getRawMany();
    
                // Ajouter les informations complètes du client
                const enrichedClients = await Promise.all(
                    topClients.map(async (client) => {
                        const clientDetails = await clientRepo.findOne({
                            where: { clientId: client.clientId },
                        });
    
                        return {
                            clientId: clientDetails?.clientId,
                            firstName: clientDetails?.name,
                            lastName: clientDetails?.lastName,
                            company: clientDetails?.clientCompany || null,
                            total: parseFloat(client.total).toFixed(2),
                        };
                    })
                );
    
                res.status(200).json(enrichedClients);
            } catch (error) {
                console.error("Erreur lors de la récupération des meilleurs clients :", error);
                res.status(500).json({ message: "Erreur lors de la récupération des meilleurs clients" });
            }
        }


    static async getPaymentStatusRatio(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            const statusCounts = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("invoice.status", "status")
                .addSelect("COUNT(*)", "count")
                .where("invoice.company = :companyId", { companyId })
                .groupBy("invoice.status")
                .getRawMany();
    
            const result = statusCounts.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count, 10);
                return acc;
            }, {});
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Erreur lors de la récupération du taux de paiement :", error);
            res.status(500).json({ message: "Erreur lors de la récupération du taux de paiement" });
        }
    }

    static async getCurrentMonthRevenue(req: Request, res: Response) {
        const companyId = req.headers["companyid"];
    
        if (!companyId) {
            return res.status(400).json({ message: "L'ID de l'entreprise est requis." });
        }
    
        try {
            const invoiceRepo = AppDataSource.getRepository(Invoice);
    
            const revenue = await invoiceRepo
                .createQueryBuilder("invoice")
                .select("SUM(CASE WHEN invoice.status = 'Paid' THEN invoice.total ELSE 0 END)", "paid")
                .addSelect("SUM(CASE WHEN invoice.status = 'Pending' THEN invoice.total ELSE 0 END)", "pending")
                .addSelect("SUM(invoice.total)", "total")
                .where("invoice.company = :companyId", { companyId })
                .andWhere("MONTH(invoice.issueDate) = MONTH(CURDATE())")
                .andWhere("YEAR(invoice.issueDate) = YEAR(CURDATE())")
                .getRawOne();
    
            res.status(200).json({
                paid: parseFloat(revenue.paid || 0).toFixed(2),
                pending: parseFloat(revenue.pending || 0).toFixed(2),
                total: parseFloat(revenue.total || 0).toFixed(2),
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des revenus du mois :", error);
            res.status(500).json({ message: "Erreur lors de la récupération des revenus du mois." });
        }
    }
}