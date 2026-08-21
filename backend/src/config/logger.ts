export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: any;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private format(level: LogLevel, message: string, context?: Record<string, any>, error?: any): string {
    const timestamp = new Date().toISOString();
    const payload: LogEntry = {
      level,
      message,
      timestamp,
      ...(context && { context }),
      ...(error && {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      }),
    };

    if (this.isProduction) {
      return JSON.stringify(payload);
    }

    const colorMap: Record<LogLevel, string> = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = colorMap[level] || reset;
    const ctxStr = context ? ` ${JSON.stringify(context)}` : '';
    const errStr = error ? `\n${error instanceof Error ? error.stack : JSON.stringify(error)}` : '';

    return `${color}[${timestamp}] [${level}]${reset} ${message}${ctxStr}${errStr}`;
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      console.debug(this.format('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    console.info(this.format('INFO', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.format('WARN', message, context));
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    console.error(this.format('ERROR', message, context, error));
  }
}

export const logger = new Logger();
