import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    const logMsg = `[${req.method}] ${req.originalUrl} ${res.statusCode} (${duration}ms)`;
    if (logLevel === 'ERROR') {
      logger.error(logMsg);
    } else if (logLevel === 'WARN') {
      logger.warn(logMsg);
    } else {
      logger.info(logMsg);
    }
  });
  next();
}
