import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { transactionService } from '../services/transaction.service';
import { ApiResponse } from '../types';
import { AppError } from '../utils/errors';

export class CustomerController {
  async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, sort } = req.query;
      const result = await customerService.listCustomers({
        search: search as string,
        status: status as any,
        sort: sort as string,
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

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Privacy check: If user is Customer, ensure they can only view their own record
      if (req.user?.role === 'Customer' && req.user.customerId !== id) {
        throw AppError.forbidden('You do not have access to view this customer record');
      }

      const customer = await customerService.getCustomerById(id);
      const transactions = await transactionService.listTransactions({ customerId: id });

      const response: ApiResponse = {
        success: true,
        data: {
          customer,
          transactions,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.createCustomer(req.body, req.user);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Customer ${result.customer.name} created successfully`,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateReminderPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await customerService.updateReminderPreference(id, req.body, req.user);
      const response: ApiResponse = {
        success: true,
        data: updated,
        message: 'Reminder preference updated',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id, req.user);
      const response: ApiResponse = {
        success: true,
        message: 'Customer deleted successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
