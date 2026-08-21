import { app } from './app';
import { env } from './config/env';
import { db } from './config/database';
import { logger } from './config/logger';

async function startServer() {
  try {
    // Initialize atomic database & seed if necessary
    await db.init();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 My Udhari Backend Server is running!`, {
        port: env.PORT,
        mode: env.NODE_ENV,
        healthCheck: `http://localhost:${env.PORT}/api/v1/health`,
        apiUrl: `http://localhost:${env.PORT}/api/v1`,
      });
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start only if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };
