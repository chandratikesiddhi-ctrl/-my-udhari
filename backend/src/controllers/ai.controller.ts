import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { reportService } from '../services/report.service';
import { ApiResponse } from '../types';

export class AiController {
  async generateReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName, amount, daysOverdue, language, tone } = req.body;
      const result = await aiService.generatePersonalizedReminder({
        customerName,
        amount: Number(amount),
        daysOverdue: daysOverdue ? Number(daysOverdue) : 8,
        language: language || 'mr',
        tone: tone || 'polite',
      });

      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getInsights(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await reportService.getSummaryReport();
      const insights = await aiService.generateCreditInsights({
        totalOutstanding: summary.totalOutstanding,
        recoveryRate: summary.recoveryRate,
        activeDebtorsCount: summary.activeDebtorsCount,
        overdueDebtorsCount: summary.agingBreakdown.overdue.count,
      });

      const response: ApiResponse = {
        success: true,
        data: {
          insights,
          metrics: {
            totalOutstanding: summary.totalOutstanding,
            recoveryRate: summary.recoveryRate,
            activeDebtorsCount: summary.activeDebtorsCount,
          },
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
