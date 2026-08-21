import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireStoreStaff } from '../middlewares/roles';
import { validate } from '../middlewares/validate';
import { validateRecordTransaction } from '../validators/schemas';

const router = Router();

// Record Credit or Payment transaction (Store Owner & Staff)
router.post(
  '/',
  authMiddleware,
  requireStoreStaff,
  validate(validateRecordTransaction),
  (req, res, next) => transactionController.recordTransaction(req, res, next)
);

// List transactions (Filtered by customerId / type / search)
router.get('/', authMiddleware, (req, res, next) =>
  transactionController.listTransactions(req, res, next)
);

export default router;
