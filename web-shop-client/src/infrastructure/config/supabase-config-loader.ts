import { injectable, inject } from 'inversify';
import { TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';
import type { DatabaseClientPort } from '../../application/ports/database-client.port';
import type { AppConfig } from '../../shared/config/app-config.types';

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
export class SupabaseConfigLoader {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.DatabaseClient) private readonly _db: DatabaseClientPort
  ) {}

  public isConfigured(): boolean {
    try {
      // Access underlying client to ensure it was created
      (this._db as any).getClient?.();
      return true;
    } catch (e) {
      this._logger.error('[SupabaseConfigLoader] Not configured', e);
      return false;
    }
  }

  public async loadConfig(appId: string): Promise<AppConfig | null> {
    this._logger.info('[SupabaseConfigLoader] Loading active config', { appId });

    const { data, error } = await this._db
      .from('app_configs')
      .select('*')
      .eq('app_id', appId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      this._logger.error('[SupabaseConfigLoader] Failed to load config', error);
      throw error;
    }

    const row = (Array.isArray(data) ? (data[0] as AppConfigRow | undefined) : undefined);
    if (!row) {
      this._logger.warn('[SupabaseConfigLoader] No active config found', { appId });
      return null;
    }

    // The JSON stored in `config` must conform to AppConfig
    const config = row.config as AppConfig;
    return config ?? null;
  }
}

