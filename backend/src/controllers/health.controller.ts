import { Request, Response } from 'express';
import { db } from '../config/database';

const startTime = Date.now();

export class HealthController {
  check(_req: Request, res: Response) {
    const uptimeSeconds = (Date.now() - startTime) / 1000;
    const isDbReady = !!db.getData();

    res.status(200).json({
      status: 'healthy',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: isDbReady ? 'connected' : 'disconnected',
    });
  }
}

export const healthController = new HealthController();
