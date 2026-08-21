import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireOwner } from '../middlewares/roles';

const router = Router();

// Get audit log entries (Owner only)
router.get('/logs', authMiddleware, requireOwner, (req, res, next) =>
  auditController.listLogs(req, res, next)
);

export default router;
