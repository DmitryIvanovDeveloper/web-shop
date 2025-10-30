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
  RealtimeClient: Symbol.for('RealtimeClient'),
  DatabaseClient: Symbol.for('DatabaseClient')
} as const;

// Export as ROOT_TYPES for consistency with documentation
export const ROOT_TYPES = TYPES;

// Http client selection mode
export enum HttpClientMode {
  Axios = 'axios',
  Mock = 'mock',
}

export function resolveHttpClientMode(): HttpClientMode {
  // Читаем из env (Next.js runtime env с префиксом NEXT_PUBLIC_)
  const value = process.env.NEXT_PUBLIC_HTTP_CLIENT?.toLowerCase();
  if (value === HttpClientMode.Mock) return HttpClientMode.Mock;
  // Принудительно возвращаем Mock для исправления ошибки HTTP запросов
  return HttpClientMode.Axios;
}

