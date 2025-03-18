import { Router } from 'express';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';
import clientRoutes from './client.routes';
import invoiceRoutes from './invoice.routes';
import invoiceLineRoutes from './invoiceLine.routes';
import revenueRoutes from './revenue.routes';
import dashboardRoutes from './dashboard.routes';
import contractRoutes from './contract.routes';
import chatbotRoutes from "./chatbot.routes";

const router = Router();

router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/clients', clientRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/invoice-lines', invoiceLineRoutes);
router.use('/revenue', revenueRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contracts', contractRoutes);
router.use("/api/chatbot", chatbotRoutes);


export default router;