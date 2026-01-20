import { injectable, inject } from 'inversify';
import { TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';
import type { DatabaseClientPort } from '../../application/ports/database-client.port';
import type { AppConfig } from '../../shared/config/app-config.types';

interface AppConfigRow {
  id: string;
  app_id: string;
  merchant_id: string;
  version: number;
  is_active: boolean;
  is_draft?: boolean;
  config: unknown;
  created_at?: string;
  updated_at?: string;
}

@injectable()
export class SupabaseConfigLoader {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.DatabaseClient) private readonly _db: DatabaseClientPort
  ) {}

  public isConfigured(): boolean {
    try {
            (this._db as any).getClient?.();
      return true;
    } catch (e) {
      this._logger.error('[SupabaseConfigLoader] Not configured', e);
      return false;
    }
  }

  public async loadConfig(appId: string): Promise<AppConfig | null> {
    this._logger.info('[SupabaseConfigLoader] Loading active config', { appId });

    this._logger.info('[SupabaseConfigLoader] Making query to Supabase', {
      appId,
      table: 'app_configs',
      filters: { app_id: appId, is_active: true, is_draft: false }
    });

    const { data, error } = await this._db
      .from('app_configs')
      .select('*')
      .eq('app_id', appId)
      .eq('is_active', true)
      .eq('is_draft', false)       .order('version', { ascending: false })       .limit(1);

    this._logger.info('[SupabaseConfigLoader] Query result', {
      dataFound: !!data,
      dataLength: data?.length,
      error: !!error,
      errorMessage: error?.message
    });

    if (error) {
      this._logger.error('[SupabaseConfigLoader] Failed to load config', error);
      this._logger.error('[SupabaseConfigLoader] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    const row = (Array.isArray(data) ? (data[0] as AppConfigRow | undefined) : undefined);
    if (!row) {
      this._logger.warn('[SupabaseConfigLoader] No active config found', { appId });
      return null;
    }

        const config = row.config as AppConfig;
    
        this._logger.info('[SupabaseConfigLoader] Config loaded from database', {
      appId,
      hasConfig: !!config,
      configKeys: config ? Object.keys(config) : [],
      hasModules: config && 'modules' in config ? !!config.modules : false,
      modulesKeys: config && 'modules' in config && config.modules ? Object.keys(config.modules) : []
    });
    
    return config ?? null;
  }

  public async loadDraftConfig(appId: string): Promise<AppConfig | null> {
    this._logger.info('[SupabaseConfigLoader] Loading draft config', { appId });

    const { data, error } = await this._db
      .from('app_configs')
      .select('*')
      .eq('app_id', appId)
      .eq('is_draft', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      this._logger.error('[SupabaseConfigLoader] Failed to load draft config', error);
      throw error;
    }

    const row = (Array.isArray(data) ? (data[0] as AppConfigRow | undefined) : undefined);
    if (!row) {
      this._logger.warn('[SupabaseConfigLoader] No draft config found', { appId });
      return null;
    }

        const config = row.config as AppConfig;
    
        this._logger.info('[SupabaseConfigLoader] Draft config loaded from database', {
      appId,
      hasConfig: !!config,
      configKeys: config ? Object.keys(config) : [],
      hasModules: config && 'modules' in config ? !!config.modules : false,
      modulesKeys: config && 'modules' in config && config.modules ? Object.keys(config.modules) : []
    });
    
    return config ?? null;
  }
}

