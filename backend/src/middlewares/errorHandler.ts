import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'An unexpected internal server error occurred';
  const errors = isAppError ? err.errors : undefined;

  logger.error(`[${req.method}] ${req.originalUrl} - Error: ${message}`, err, {
    statusCode,
    code,
    path: req.path,
    ip: req.ip,
  });

  const response: ApiResponse = {
    success: false,
    code,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    code: 'NOT_FOUND',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(response);
}
