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
        .select('id, version')
        .eq('app_id', config.appId)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1);

      const newVersion = existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0
        ? (existingDraft[0].version as number) + 1
        : 1;

      if (existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0) {
        // Update existing draft with new version
        const { error } = await this._db
          .from('app_configs')
          .update({
            version: newVersion,
            config: config.config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDraft[0].id);

        if (error) {
          this._logger.error('[SupabaseConfigStorage] Failed to update draft', error);
          return Result.fail(new Error(`Failed to update draft: ${error.message}`));
        }

        this._logger.info('[SupabaseConfigStorage] Draft updated successfully', { appId: config.appId, version: newVersion });
      } else {
        // Insert new draft config if none exists
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
          this._logger.error('[SupabaseConfigStorage] Failed to insert draft', error);
          return Result.fail(new Error(`Failed to insert draft: ${error.message}`));
        }

        this._logger.info('[SupabaseConfigStorage] Draft created successfully', { appId: config.appId, version: newVersion });
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error saving draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadDraft(appId: string): Promise<Result<AppConfig | null, Error>> {
    this._logger.info('[SupabaseConfigStorage] Loading draft config', { appId });
    
    try {
      const { data, error } = await this._db
        .from('app_configs')
        .select('config')
        .eq('app_id', appId)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1);
      
      if (error) {
        this._logger.error('[SupabaseConfigStorage] Failed to load draft', error);
        return Result.fail(new Error(`Failed to load draft: ${error.message}`));
      }
      
      if (!data || data.length === 0) {
        this._logger.info('[SupabaseConfigStorage] No draft config found', { appId });
        return Result.ok<AppConfig | null, Error>(null);
      }
      
      this._logger.info('[SupabaseConfigStorage] Draft config loaded successfully', { appId });
      return Result.ok<AppConfig | null, Error>(data[0].config as AppConfig);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error loading draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async loadActive(appId: string): Promise<Result<AppConfig | null, Error>> {
    this._logger.info('[SupabaseConfigStorage] Loading active config', { appId });
    
    try {
      const { data, error } = await this._db
        .from('app_configs')
        .select('config')
        .eq('app_id', appId)
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        this._logger.error('[SupabaseConfigStorage] Failed to load active config', error);
        return Result.fail(new Error(`Failed to load active config: ${error.message}`));
      }
      
      if (!data || data.length === 0) {
        this._logger.info('[SupabaseConfigStorage] No active config found', { appId });
        return Result.ok<AppConfig | null, Error>(null);
      }
      
      this._logger.info('[SupabaseConfigStorage] Active config loaded successfully', { appId });
      return Result.ok<AppConfig | null, Error>(data[0].config as AppConfig);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error loading active config', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>> {
    return Result.fail(new Error('Not implemented'));
  }
}





