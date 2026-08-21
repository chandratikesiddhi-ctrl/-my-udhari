import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { ApiResponse } from '../types';
import { AppError } from '../utils/errors';

export class TransactionController {
  async recordTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.recordTransaction(req.body, req.user);
      const isCredit = result.transaction.type === 'CREDIT';
      const actionText = isCredit ? 'Credit recorded' : 'Payment recorded';

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `${actionText} for ${result.customer.name} (Balance: ₹${result.customer.balance})`,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, type, search } = req.query;

      // Privacy check: If user is Customer, ensure they can only query their own transactions
      if (req.user?.role === 'Customer' && customerId && req.user.customerId !== customerId) {
        throw AppError.forbidden('You do not have permission to view other customers\' transactions');
      }

      const effectiveCustomerId =
        req.user?.role === 'Customer' ? req.user.customerId : (customerId as string);

      const transactions = await transactionService.listTransactions({
        customerId: effectiveCustomerId,
        type: type as any,
        search: search as string,
      });

      const response: ApiResponse = {
        success: true,
        data: transactions,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
