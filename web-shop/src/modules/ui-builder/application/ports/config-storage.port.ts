import { Result } from '@/shared/result/result';
import { AppConfig } from '../../domain/entities/app-config.entity';

export interface ConfigStoragePort {
  
  loadConfig(appId: string): Promise<Result<AppConfig, Error>>;

  saveConfig(config: AppConfig): Promise<Result<void, Error>>;

  deactivateConfig(appId: string): Promise<Result<void, Error>>;

  getConfigHistory(appId: string, limit?: number): Promise<Result<AppConfig[], Error>>;

  saveDraft(config: AppConfig): Promise<Result<void, Error>>;

  loadDraft(appId: string): Promise<Result<AppConfig | null, Error>>;

  loadActive(appId: string): Promise<Result<AppConfig | null, Error>>;

  publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>>;
}

