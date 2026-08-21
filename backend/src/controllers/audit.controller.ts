import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { ApiResponse } from '../types';

export class AuditController {
  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = await auditService.listLogs(limit);
      const response: ApiResponse = {
        success: true,
        data: logs,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
