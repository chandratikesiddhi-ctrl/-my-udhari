import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/crypto';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);

    if (!payload) {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
