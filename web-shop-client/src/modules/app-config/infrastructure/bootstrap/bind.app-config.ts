import type { Container } from 'inversify';
import { APP_CONFIG_TYPES } from './types';
import { AppConfigHttpRepository } from '../repositories/app-config-http.repository';

export function bindAppConfig(container: Container): void {
  container
    .bind(APP_CONFIG_TYPES.AppConfigRepository)
    .to(AppConfigHttpRepository)
    .inSingletonScope();
}