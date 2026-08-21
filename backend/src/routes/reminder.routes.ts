import { Router } from 'express';
import { reminderController } from '../controllers/reminder.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireStoreStaff } from '../middlewares/roles';

const router = Router();

// List reminders by status (SCHEDULED, SENT, FAILED)
router.get('/', authMiddleware, requireStoreStaff, (req, res, next) =>
  reminderController.listReminders(req, res, next)
);

// Scan ledger and auto-schedule eligible 8-day reminders
router.post('/scan', authMiddleware, requireStoreStaff, (req, res, next) =>
  reminderController.scanAndSchedule(req, res, next)
);

// Batch dispatch all scheduled reminders
router.post('/batch-send', authMiddleware, requireStoreStaff, (req, res, next) =>
  reminderController.processBatch(req, res, next)
);

// Send single reminder
router.post('/:id/send', authMiddleware, requireStoreStaff, (req, res, next) =>
  reminderController.sendSingle(req, res, next)
);

// Retry failed reminder
router.post('/:id/retry', authMiddleware, requireStoreStaff, (req, res, next) =>
  reminderController.retry(req, res, next)
);

export default router;
