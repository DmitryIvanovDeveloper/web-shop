import { injectable, inject } from 'inversify';
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

interface AppConfigRow {
  id: string;
  app_id: string;
  version: string;
  is_active: boolean;
  is_draft?: boolean;
  config: unknown;
  created_at?: string;
}

@injectable()
export class SupabaseConfigStorage implements ConfigStoragePort {
  constructor(
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger,
    @inject(ROOT_TYPES.DatabaseClient) private readonly _db: DatabaseClientPort
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
    this._logger.info('[SupabaseConfigStorage] Saving draft config', { appId: config.appId, version: config.version.value });
    
    try {
      // Check if draft already exists for this app_id
      const { data: existingDraft } = await this._db
        .from('app_configs')
        .select('version')
        .eq('app_id', config.appId)
        .eq('is_draft', true)
        .order('created_at', { ascending: false })
        .limit(1);

      const newVersion = existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0
        ? (existingDraft[0].version as number) + 1
        : 1;

      // Insert new draft config
      const { error } = await this._db
        .from('app_configs')
        .insert({
          app_id: config.appId,
          merchant_id: config.appId, // Use appId as merchant_id for now
          version: newVersion,
          is_active: false,
          is_draft: true,
          config: config.config,
        });

      if (error) {
        this._logger.error('[SupabaseConfigStorage] Failed to save draft', error);
        return Result.fail(new Error(`Failed to save draft: ${error.message}`));
      }

      this._logger.info('[SupabaseConfigStorage] Draft saved successfully', { appId: config.appId, version: newVersion });
      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error saving draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadDraft(appId: string): Promise<Result<AppConfig | null, Error>> {
    return Result.ok<AppConfig | null, Error>(null);
  }

  async publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>> {
    return Result.fail(new Error('Not implemented'));
  }
}





