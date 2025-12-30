import { injectable, inject } from 'inversify';
import type { ConfigStoragePort } from '../../application/ports/config-storage.port';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import { ConfigVersion } from '../../domain/value-objects/config-version.vo';
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
            is_active: false, // Ensure draft is never active
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
        .select('id, app_id, version, is_active, is_draft, config, created_at')
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
      
      const row = data[0] as AppConfigRow;
      const appConfig: AppConfig = {
        id: row.id,
        appId: row.app_id,
        version: ConfigVersion.of(Number.parseInt(row.version, 10)),
        isDraft: row.is_draft ?? false,
        isActive: row.is_active ?? false,
        config: row.config,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
      };
      
      this._logger.info('[SupabaseConfigStorage] Draft config loaded successfully', { appId });
      return Result.ok<AppConfig | null, Error>(appConfig);
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
        .select('id, app_id, version, is_active, is_draft, config, created_at')
        .eq('app_id', appId)
        .eq('is_active', true)
        .eq('is_draft', false)
        .order('version', { ascending: false })
        .limit(1);
      
      if (error) {
        this._logger.error('[SupabaseConfigStorage] Failed to load active config', error);
        return Result.fail(new Error(`Failed to load active config: ${error.message}`));
      }
      
      if (!data || data.length === 0) {
        this._logger.info('[SupabaseConfigStorage] No active config found', { appId });
        return Result.ok<AppConfig | null, Error>(null);
      }
      
      const row = data[0] as AppConfigRow;
      const appConfig: AppConfig = {
        id: row.id,
        appId: row.app_id,
        version: ConfigVersion.of(Number.parseInt(row.version, 10)),
        isDraft: row.is_draft ?? false,
        isActive: row.is_active ?? false,
        config: row.config,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
      };
      
      this._logger.info('[SupabaseConfigStorage] Active config loaded successfully', { appId });
      return Result.ok<AppConfig | null, Error>(appConfig);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error loading active config', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async publishDraft(appId: string, draftVersion: number): Promise<Result<AppConfig, Error>> {
    this._logger.info('[SupabaseConfigStorage] Publishing draft', { appId, version: draftVersion });
    
    try {
      // Find the draft config - first find the latest draft for this app if version not specified
      let draftData: any;
      
      if (draftVersion > 0) {
        // Find specific version
        const { data, error: draftError } = await this._db
          .from('app_configs')
          .select('id, config, version')
          .eq('app_id', appId)
          .eq('version', draftVersion)
          .eq('is_draft', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (draftError) {
          this._logger.error('[SupabaseConfigStorage] Draft not found', draftError);
          return Result.fail(new Error(`Draft not found: ${draftError?.message}`));
        }
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          this._logger.error('[SupabaseConfigStorage] Draft not found', { appId, version: draftVersion });
          return Result.fail(new Error(`Draft not found for app_id: ${appId}, version: ${draftVersion}`));
        }
        
        draftData = Array.isArray(data) ? data[0] : data;
      } else {
        // Find latest draft
        const { data, error: draftError } = await this._db
          .from('app_configs')
          .select('id, config, version')
          .eq('app_id', appId)
          .eq('is_draft', true)
          .order('version', { ascending: false })
          .limit(1);
        
        if (draftError || !data || data.length === 0) {
          this._logger.error('[SupabaseConfigStorage] No draft found', draftError);
          return Result.fail(new Error(`No draft found: ${draftError?.message}`));
        }
        draftData = data[0];
      }

      // Deactivate all current active configs for this app
      const { error: deactivateError } = await this._db
        .from('app_configs')
        .update({ is_active: false })
        .eq('app_id', appId)
        .eq('is_active', true);

      if (deactivateError) {
        this._logger.error('[SupabaseConfigStorage] Failed to deactivate active configs', deactivateError);
        return Result.fail(new Error(`Failed to deactivate active configs: ${deactivateError.message}`));
      }

      // Activate the draft config (mark as both active and not draft)
      const { error: activateError } = await this._db
        .from('app_configs')
        .update({ 
          is_active: true, 
          is_draft: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftData.id);

      if (activateError) {
        this._logger.error('[SupabaseConfigStorage] Failed to activate draft', activateError);
        return Result.fail(new Error(`Failed to activate draft: ${activateError.message}`));
      }

      this._logger.info('[SupabaseConfigStorage] Draft published successfully', { 
        appId, 
        version: draftData.version 
      });
      return Result.ok<AppConfig, Error>(draftData.config as AppConfig);
    } catch (error) {
      this._logger.error('[SupabaseConfigStorage] Error publishing draft', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}





