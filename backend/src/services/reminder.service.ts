import { reminderRepository } from '../repositories/reminder.repository';
import { customerRepository } from '../repositories/customer.repository';
import { storeRepository } from '../repositories/store.repository';
import { auditRepository } from '../repositories/audit.repository';
import { ReminderJob, JwtPayload } from '../types';
import { AppError } from '../utils/errors';
import { generateReminderMessage } from '../utils/formatters';

export class ReminderService {
  async listReminders(status?: string): Promise<{
    jobs: ReminderJob[];
    scheduledCount: number;
    sentCount: number;
    failedCount: number;
  }> {
    const allJobs = await reminderRepository.findAll();
    const scheduledCount = allJobs.filter((r) => r.status === 'SCHEDULED').length;
    const sentCount = allJobs.filter((r) => r.status === 'SENT' || r.status === 'DELIVERED').length;
    const failedCount = allJobs.filter((r) => r.status === 'FAILED').length;

    const filteredJobs = status && status !== 'ALL' ? allJobs.filter((r) => r.status === status) : allJobs;

    return {
      jobs: filteredJobs,
      scheduledCount,
      sentCount,
      failedCount,
    };
  }

  /**
   * Scan customer ledger and generate eligible 8-day reminder jobs
   */
  async scanAndScheduleReminders(user?: JwtPayload): Promise<{ newlyScheduled: ReminderJob[]; count: number }> {
    const customers = await customerRepository.findAll();
    const store = await storeRepository.getProfile();
    const existingReminders = await reminderRepository.findAll();

    const now = Date.now();
    const newlyScheduled: ReminderJob[] = [];

    for (const customer of customers) {
      if (!customer.reminderEnabled || customer.balance <= 0) {
        continue;
      }

      const intervalDays = customer.reminderIntervalDays || store.reminderIntervalDays || 8;
      const lastActive = new Date(customer.lastReminderSentDate || customer.lastTransactionDate).getTime();
      const daysSince = (now - lastActive) / (1000 * 60 * 60 * 24);

      if (daysSince >= intervalDays) {
        // Check if already has a pending SCHEDULED reminder
        const hasPending = existingReminders.some(
          (r) => r.customerId === customer.id && r.status === 'SCHEDULED'
        );

        if (!hasPending) {
          const messageText = generateReminderMessage(
            customer.name,
            customer.balance,
            store.name,
            store.upiId,
            'en'
          );

          const job: ReminderJob = {
            id: `rem-${Date.now()}-${customer.id.replace('cust-', '')}`,
            storeId: store.id,
            customerId: customer.id,
            customerName: customer.name,
            phone: customer.phone,
            amount: customer.balance,
            shopName: store.name,
            scheduledDate: new Date().toISOString(),
            status: 'SCHEDULED',
            channel: store.preferredChannel || 'WHATSAPP',
            retries: 0,
            messageText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const saved = await reminderRepository.create(job);
          newlyScheduled.push(saved);
        }
      }
    }

    if (newlyScheduled.length > 0) {
      await auditRepository.create({
        id: `log-${Date.now()}`,
        storeId: store.id,
        actor: user ? `${user.name} (${user.role})` : 'Automated 8-Day Engine',
        action: 'SCHEDULE_REMINDERS',
        entity: 'ReminderJob',
        entityId: 'batch',
        timestamp: new Date().toISOString(),
        result: 'SUCCESS',
        details: `Scheduled ${newlyScheduled.length} automated 8-day reminders`,
      });
    }

    return { newlyScheduled, count: newlyScheduled.length };
  }

  /**
   * Batch process all scheduled reminders
   */
  async processBatchReminders(user?: JwtPayload): Promise<{ processedCount: number; jobs: ReminderJob[] }> {
    const scheduled = await reminderRepository.findAll('SCHEDULED');
    const nowIso = new Date().toISOString();
    const processedJobs: ReminderJob[] = [];

    for (const job of scheduled) {
      const updated = await reminderRepository.update(job.id, {
        status: 'SENT',
        sentAt: nowIso,
      });
      if (updated) {
        // Update customer's lastReminderSentDate
        await customerRepository.update(job.customerId, {
          lastReminderSentDate: nowIso,
        });
        processedJobs.push(updated);
      }
    }

    if (processedJobs.length > 0) {
      await auditRepository.create({
        id: `log-${Date.now()}`,
        storeId: 'store-01',
        actor: user ? `${user.name} (${user.role})` : 'Automated 8-Day Engine',
        action: 'PROCESS_BATCH_REMINDERS',
        entity: 'ReminderJob',
        entityId: 'batch',
        timestamp: nowIso,
        result: 'SUCCESS',
        details: `Processed batch dispatch of ${processedJobs.length} reminders`,
      });
    }

    return { processedCount: processedJobs.length, jobs: processedJobs };
  }

  /**
   * Send single reminder job
   */
  async sendSingleReminder(id: string, user?: JwtPayload): Promise<ReminderJob> {
    const job = await reminderRepository.findById(id);
    if (!job) {
      throw AppError.notFound('Reminder job not found');
    }

    const nowIso = new Date().toISOString();
    const updated = await reminderRepository.update(id, {
      status: 'SENT',
      sentAt: nowIso,
    });

    await customerRepository.update(job.customerId, {
      lastReminderSentDate: nowIso,
    });

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: job.storeId,
      actor: user ? `${user.name} (${user.role})` : 'Store Admin',
      action: 'SEND_REMINDER',
      entity: 'ReminderJob',
      entityId: job.id,
      timestamp: nowIso,
      result: 'SUCCESS',
      details: `Dispatched reminder to ${job.customerName} (₹${job.amount}) via ${job.channel}`,
    });

    return updated!;
  }

  /**
   * Retry failed reminder
   */
  async retryReminder(id: string, user?: JwtPayload): Promise<ReminderJob> {
    const job = await reminderRepository.findById(id);
    if (!job) {
      throw AppError.notFound('Reminder job not found');
    }

    const nowIso = new Date().toISOString();
    const updated = await reminderRepository.update(id, {
      status: 'SENT',
      sentAt: nowIso,
      failureReason: undefined,
      retries: (job.retries || 0) + 1,
    });

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: job.storeId,
      actor: user ? `${user.name} (${user.role})` : 'Store Admin',
      action: 'RETRY_REMINDER',
      entity: 'ReminderJob',
      entityId: job.id,
      timestamp: nowIso,
      result: 'SUCCESS',
      details: `Retried failed reminder to ${job.customerName}`,
    });

    return updated!;
  }
}

export const reminderService = new ReminderService();
