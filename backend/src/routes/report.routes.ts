import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireStoreStaff } from '../middlewares/roles';

const router = Router();

// Full summary & 6-month trend analytics (Store Owner & Staff)
router.get('/summary', authMiddleware, requireStoreStaff, (req, res, next) =>
  reportController.getSummary(req, res, next)
);

// Export full ledger CSV (Store Owner & Staff)
router.get('/export-csv', authMiddleware, requireStoreStaff, (req, res, next) =>
  reportController.exportCsv(req, res, next)
);

export default router;
