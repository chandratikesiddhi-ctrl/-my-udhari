import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { ApiResponse } from '../types';

export class ReportController {
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await reportService.getSummaryReport();
      const response: ApiResponse = {
        success: true,
        data: summary,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await reportService.generateLedgerCsv();
      const fileName = `My_Udhari_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
