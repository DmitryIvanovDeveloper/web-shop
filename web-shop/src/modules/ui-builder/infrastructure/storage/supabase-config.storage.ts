import { injectable, inject } from 'inversify';
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

@injectable()
export class SupabaseConfigStorage implements ConfigStoragePort {
  constructor(
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger
  ) {}

  async loadConfig(appId: string): Promise<Result<AppConfig, Error>> {
    return Result.fail(new Error('Not implemented'));
  }

  async saveConfig(config: AppConfig): Promise<Result<void, Error>> {
    return Result.fail(new Error('Not implemented'));
  }

  async deactivateConfig(appId: string): Promise<Result<void, Error>> {
    return Result.ok<void, Error>(undefined as void);
  }

  async getConfigHistory(appId: string, limit?: number): Promise<Result<AppConfig[], Error>> {
    return Result.ok<AppConfig[], Error>([]);
  }

  async saveDraft(config: AppConfig): Promise<Result<void, Error>> {
    return Result.ok<void, Error>(undefined as void);
  }

  async loadDraft(appId: string): Promise<Result<AppConfig | null, Error>> {
    return Result.ok<AppConfig | null, Error>(null);
  }

  async publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>> {
    return Result.fail(new Error('Not implemented'));
  }
}





