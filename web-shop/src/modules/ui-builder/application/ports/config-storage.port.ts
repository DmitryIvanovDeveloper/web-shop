import { Result } from '@/shared/result/result';
import { AppConfig } from '../../domain/entities/app-config.entity';

export interface ConfigStoragePort {
  /**
   * Load active config by app_id
   */
  loadConfig(appId: string): Promise<Result<AppConfig, Error>>;

  /**
   * Save config (creates new version and deactivates old one)
   */
  saveConfig(config: AppConfig): Promise<Result<void, Error>>;

  /**
   * Deactivate current active config for app_id
   */
  deactivateConfig(appId: string): Promise<Result<void, Error>>;

  /**
   * Get all versions for an app_id
   */
  getConfigHistory(appId: string, limit?: number): Promise<Result<AppConfig[], Error>>;

  /**
   * Save draft config (creates new draft version)
   */
  saveDraft(config: AppConfig): Promise<Result<void, Error>>;

  /**
   * Load most recent draft config by app_id
   */
  loadDraft(appId: string): Promise<Result<AppConfig | null, Error>>;

  /**
   * Publish draft (deactivate current active, activate draft)
   */
  publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>>;
}





export interface ConfigStoragePort {
  /**
   * Load active config by app_id
   */
  loadConfig(appId: string): Promise<Result<AppConfig, Error>>;

  /**
   * Save config (creates new version and deactivates old one)
   */
  saveConfig(config: AppConfig): Promise<Result<void, Error>>;

  /**
   * Deactivate current active config for app_id
   */
  deactivateConfig(appId: string): Promise<Result<void, Error>>;

  /**
   * Get all versions for an app_id
   */
  getConfigHistory(appId: string, limit?: number): Promise<Result<AppConfig[], Error>>;

  /**
   * Save draft config (creates new draft version)
   */
  saveDraft(config: AppConfig): Promise<Result<void, Error>>;

  /**
   * Load most recent draft config by app_id
   */
  loadDraft(appId: string): Promise<Result<AppConfig | null, Error>>;

  /**
   * Publish draft (deactivate current active, activate draft)
   */
  publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>>;
}




