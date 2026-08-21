import { Router } from 'express';
import { backupController } from '../controllers/backup.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireOwner } from '../middlewares/roles';

const router = Router();

// Export full database JSON backup (Owner only)
router.get('/export', authMiddleware, requireOwner, (req, res, next) =>
  backupController.exportBackup(req, res, next)
);

// Reset demo dataset (Owner only)
router.post('/reset-demo', authMiddleware, requireOwner, (req, res, next) =>
  backupController.resetDemoData(req, res, next)
);

export default router;
