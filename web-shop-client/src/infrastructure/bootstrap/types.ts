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
	Browser: Symbol.for('Browser'),
	DatabaseClient: Symbol.for('DatabaseClient'),
	UIRenderer: Symbol.for('UIRenderer'),
	UIComponentRegistry: Symbol.for('UIComponentRegistry'),
	UIStyleBuilder: Symbol.for('UIStyleBuilder'),
	UIActionHandler: Symbol.for('UIActionHandler'),
	LoadAppConfig: Symbol.for('LoadAppConfig'),
	LoadAppConfigFromMessage: Symbol.for('LoadAppConfigFromMessage'),
	LoadGrapeJsConfig: Symbol.for('LoadGrapeJsConfig'),
	SupabaseConfigLoader: Symbol.for('SupabaseConfigLoader'),
	ConfigSubscriptionPort: Symbol.for('ConfigSubscriptionPort'),
	SubscribeToConfigUpdates: Symbol.for('SubscribeToConfigUpdates'),
	AppConfigRepository: Symbol.for('AppConfigRepository'),
	AppContext: Symbol.for('AppContext'),
	GetAppContext: Symbol.for('GetAppContext')
} as const;

export const ROOT_TYPES = TYPES;

export { AUTH_TYPES } from '../../modules/authentication/infrastructure/bootstrap/types';

export { LOCALIZATION_TYPES } from '../../modules/localization/infrastructure/bootstrap/types';

export { DAILY_REWARDS_TYPES } from '../../modules/daily-rewards/infrastructure/bootstrap/types';

export enum HttpClientMode {
  Axios = 'axios',
  Mock = 'mock',
}

export function resolveHttpClientMode(): HttpClientMode {
    const value = process.env.NEXT_PUBLIC_HTTP_CLIENT?.toLowerCase();
  if (value === HttpClientMode.Mock) return HttpClientMode.Mock;
  return HttpClientMode.Axios;
}

