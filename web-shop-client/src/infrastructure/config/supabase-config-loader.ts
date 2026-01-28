import { injectable, inject } from 'inversify';
import { TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';
import type { AppConfigRepositoryPort } from '../../modules/app-config/application/ports/app-config-repository.port';
import type { GrapeJsAppConfig } from '../../shared/config/grapejs-app-config.types';
import { isFailure } from '../../shared/result/result';

@injectable()
export class SupabaseConfigLoader {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.AppConfigRepository) private readonly _repository: AppConfigRepositoryPort
  ) {}

  public isConfigured(): boolean {
    // Since we're now using HTTP API, we consider it configured by default
    return true;
  }

  public async loadConfig(appId: string): Promise<GrapeJsAppConfig | null> {
    this._logger.info('[SupabaseConfigLoader] Loading active config via HTTP', { appId });

    const result = await this._repository.loadActiveConfig(appId);

    if (isFailure(result)) {
      this._logger.error('[SupabaseConfigLoader] Failed to load active config', result.error);
      throw result.error;
    }

    const config = result.data;

    console.log('[SupabaseConfigLoader] Full result object:', result);
    console.log('[SupabaseConfigLoader] result.data type:', typeof config);
    console.log('[SupabaseConfigLoader] result.data is null:', config === null);
    console.log('[SupabaseConfigLoader] result.data is undefined:', config === undefined);
    console.log('[SupabaseConfigLoader] result.data keys:', config ? Object.keys(config) : 'N/A');


    this._logger.info('[SupabaseConfigLoader] Active GrapeJS config loaded successfully', {
      appId,
      hasConfig: !!config,
      pagesCount: config?.pages?.length || 0,
      stylesCount: config?.styles?.length || 0,
      assetsCount: config?.assets?.length || 0,
      symbolsCount: config?.symbols?.length || 0
    });

    return config;
  }

  public async loadDraftConfig(appId: string): Promise<GrapeJsAppConfig | null> {
    this._logger.info('[SupabaseConfigLoader] Loading draft config via HTTP', { appId });

    const result = await this._repository.loadDraftConfig(appId);

    if (isFailure(result)) {
      this._logger.error('[SupabaseConfigLoader] Failed to load draft config', result.error);
      throw result.error;
    }

    const config = result.data;

    this._logger.info('[SupabaseConfigLoader] Draft GrapeJS config loaded successfully', {
      appId,
      hasConfig: !!config,
      pagesCount: config?.pages?.length || 0,
      stylesCount: config?.styles?.length || 0,
      assetsCount: config?.assets?.length || 0,
      symbolsCount: config?.symbols?.length || 0
    });

    return config;
  }
}

