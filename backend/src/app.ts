import express, { Express } from 'express';
import { corsMiddleware, requestLogger } from './middlewares/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import apiV1Router from './routes';

export function createApp(): Express {
  const app = express();

  // Middleware pipeline
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);

  // Mount API v1 routes
  app.use('/api/v1', apiV1Router);

  // 404 handler for API routes
  app.use('/api/v1/*', notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
