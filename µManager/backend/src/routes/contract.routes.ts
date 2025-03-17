import { Router } from 'express';
import { ContractController } from '../controllers/ContractController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Create
router.post('/', authMiddleware, ContractController.create);

// Read All
router.get('/', authMiddleware, ContractController.findAll);

// Read One
router.get('/:contractId', authMiddleware, ContractController.findById);

// Update
router.put('/:contractId', authMiddleware, ContractController.update);

// Delete
router.delete('/:contractId', authMiddleware, ContractController.delete);

//Find by company
router.get('/company/:companyId', authMiddleware, ContractController.findByCompany);

export default router;