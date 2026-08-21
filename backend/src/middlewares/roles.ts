import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function requireRoles(allowedRoles: Array<'Owner' | 'Staff' | 'Customer'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Action restricted. Required role: [${allowedRoles.join(', ')}], current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

export const requireOwner = requireRoles(['Owner']);
export const requireStoreStaff = requireRoles(['Owner', 'Staff']);
export const requireCustomer = requireRoles(['Customer']);
