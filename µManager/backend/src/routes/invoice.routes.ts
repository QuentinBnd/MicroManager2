import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Routes existantes
router.post('/', authMiddleware, InvoiceController.createInvoice);
router.get('/', authMiddleware, InvoiceController.getAllInvoices);
router.get('/:invoiceId', authMiddleware, InvoiceController.getInvoiceById);
router.put('/:invoiceId', authMiddleware, InvoiceController.updateInvoice);
router.delete('/:invoiceId', authMiddleware, InvoiceController.deleteInvoice);
router.get('/company/:companyId', authMiddleware, InvoiceController.getInvoicesByCompanyId);
router.put('/:invoiceId/lines', authMiddleware, InvoiceController.updateInvoiceLines);
router.post('/:invoiceId/send-email', authMiddleware, InvoiceController.sendInvoiceByEmail);

export default router;