import { Request, Response, NextFunction } from 'express';
import { reminderService } from '../services/reminder.service';
import { ApiResponse } from '../types';

export class ReminderController {
  async listReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const result = await reminderService.listReminders(status as string);
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async scanAndSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reminderService.scanAndScheduleReminders(req.user);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Scanned ledger: ${result.count} new reminders scheduled`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async processBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reminderService.processBatchReminders(req.user);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Dispatched ${result.processedCount} automated 8-day reminders`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async sendSingle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await reminderService.sendSingleReminder(id, req.user);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Reminder sent to ${result.customerName}`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await reminderService.retryReminder(id, req.user);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Reminder retried for ${result.customerName}`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const reminderController = new ReminderController();
