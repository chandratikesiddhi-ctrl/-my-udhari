import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(AppError.rateLimit(`Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)} seconds.`));
    }

    record.count += 1;
    next();
  };
}
