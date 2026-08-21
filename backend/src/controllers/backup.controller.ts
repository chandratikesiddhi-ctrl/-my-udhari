import { Request, Response, NextFunction } from 'express';
import { backupService } from '../services/backup.service';
import { ApiResponse } from '../types';

export class BackupController {
  async exportBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const backup = await backupService.exportBackup(req.user);
      const response: ApiResponse = {
        success: true,
        data: backup,
        message: 'Database backup snapshot generated',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetDemoData(req: Request, res: Response, next: NextFunction) {
    try {
      await backupService.resetDemoData(req.user);
      const response: ApiResponse = {
        success: true,
        message: 'Demo dataset restored to initial state',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const backupController = new BackupController();
