import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  JWT_SECRET: string;
  GEMINI_API_KEY?: string;
  APP_URL: string;
  DATA_DIR: string;
  DEFAULT_PIN: string;
}

export const env: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'my-udhari-super-secret-jwt-key-2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  DATA_DIR: process.env.DATA_DIR || path.resolve(process.cwd(), 'backend', 'data'),
  DEFAULT_PIN: process.env.DEFAULT_PIN || '1234',
};
