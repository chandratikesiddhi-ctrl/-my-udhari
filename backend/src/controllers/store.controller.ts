import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service';
import { ApiResponse } from '../types';

export class StoreController {
  async getProfile(_req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await storeService.getProfile();
      const response: ApiResponse = {
        success: true,
        data: profile,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await storeService.updateProfile(req.body, req.user);
      const response: ApiResponse = {
        success: true,
        data: updated,
        message: 'Store settings updated successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();
