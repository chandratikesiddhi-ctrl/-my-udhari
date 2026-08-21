import { Router } from 'express';
import authRoutes from './auth.routes';
import storeRoutes from './store.routes';
import customerRoutes from './customer.routes';
import transactionRoutes from './transaction.routes';
import reminderRoutes from './reminder.routes';
import reportRoutes from './report.routes';
import auditRoutes from './audit.routes';
import backupRoutes from './backup.routes';
import aiRoutes from './ai.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/store', storeRoutes);
router.use('/customers', customerRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reminders', reminderRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);
router.use('/backup', backupRoutes);
router.use('/ai', aiRoutes);

export default router;
