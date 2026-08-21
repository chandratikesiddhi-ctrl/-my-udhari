import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../types';

export class AuthController {
  async storeLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, pin } = req.body;
      const result = await authService.storeLogin(role, pin);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Signed in successfully as ${role}`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async customerSendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await authService.customerSendOtp(phone);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'OTP sent to mobile number',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async customerVerifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      const result = await authService.customerVerifyOtp(phone, otp);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Customer verified successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentSession(req: Request, res: Response, next: NextFunction) {
    try {
      const response: ApiResponse = {
        success: true,
        data: req.user,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
