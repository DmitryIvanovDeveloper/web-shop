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

export const TYPES = {
  Logger: Symbol.for('Logger'),
  HttpClient: Symbol.for('HttpClient'),
  EventBus: Symbol.for('EventBus'),
  RealtimeClient: Symbol.for('RealtimeClient'),
  DatabaseClient: Symbol.for('DatabaseClient')
} as const;

export const ROOT_TYPES = TYPES;

export enum HttpClientMode {
  Axios = 'axios',
  Mock = 'mock',
}

export function resolveHttpClientMode(): HttpClientMode {
  
  const value = process.env.NEXT_PUBLIC_HTTP_CLIENT?.toLowerCase();
  if (value === HttpClientMode.Mock) return HttpClientMode.Mock;
  
  return HttpClientMode.Axios;
}

