export interface ServiceConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  logging: LoggingConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
}
// Inversify TYPES symbols
export const TYPES = {
  Logger: Symbol.for('Logger'),
  HttpClient: Symbol.for('HttpClient'),
  EventBus: Symbol.for('EventBus'),
  RealtimeClient: Symbol.for('RealtimeClient')
} as const;

// Export as ROOT_TYPES for consistency with documentation
export const ROOT_TYPES = TYPES;

// Payment Service doesn't have authentication module
// Authentication is handled by the main client service

// Export SHOP_TYPES from shop module (if needed)
// Http client selection mode
export enum HttpClientMode {
  Axios = 'axios',
  Mock = 'mock',
}

export function resolveHttpClientMode(): HttpClientMode {
  // Читаем из env (Next.js runtime env с префиксом NEXT_PUBLIC_)
  const value = process.env.NEXT_PUBLIC_HTTP_CLIENT?.toLowerCase();
  if (value === HttpClientMode.Mock) {
    return HttpClientMode.Mock;
  }

  // По умолчанию используем Axios HTTP клиент для реальных API вызовов
  return HttpClientMode.Axios;
}

