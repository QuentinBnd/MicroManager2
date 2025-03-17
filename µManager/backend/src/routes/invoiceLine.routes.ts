import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Mise à jour des lignes de facture
/* router.put('/:invoiceId/lines', authMiddleware, InvoiceController.updateInvoiceLines);
 */
export default router;