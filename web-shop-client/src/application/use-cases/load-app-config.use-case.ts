import { injectable, inject } from 'inversify';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { AppConfig } from '../../shared/config/app-config.types';
import type { SupabaseConfigLoader } from '../../infrastructure/config/supabase-config-loader';

@injectable()
export class LoadAppConfigUseCase {
	constructor(
    // HTTP fallback удалён: конфиг загружаем только из Supabase
		@inject(TYPES.EventBus)
		private readonly _eventBus: EventBus,
		@inject(TYPES.Logger)
		private readonly _logger: Logger,
		@inject(TYPES.SupabaseConfigLoader)
		private readonly _supabaseLoader: SupabaseConfigLoader
	) {}

	public async execute(isDraft?: boolean): Promise<void> {
		this._logger.info('[LoadAppConfigUseCase] Loading app configuration', { isDraft });

		try {
      const appId = this._getAppIdFromEnvironment();
      if (!appId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

      // Use isDraft parameter to determine which config to load
      let config: AppConfig | null = null;
      
      if (isDraft) {
        config = await this._supabaseLoader.loadDraftConfig(appId);
      } else {
        config = await this._supabaseLoader.loadConfig(appId);
        
        // If active config not found, try to load draft as fallback (for UI Builder preview mode)
        if (!config) {
          this._logger.warn('[LoadAppConfigUseCase] Active config not found, trying draft as fallback', { appId });
          config = await this._supabaseLoader.loadDraftConfig(appId);
        }
      }
      
      if (!config) {
        const configType = isDraft ? 'draft' : 'active';
        throw new Error(`[LoadAppConfigUseCase] Failed to load ${configType} config from Supabase for appId: ${appId}`);
      }

      this._logger.info('[LoadAppConfigUseCase] App config loaded successfully (Supabase)', {
        version: config.version,
        environment: config.environment,
        isDraft
      });

			// Publish event for all modules to consume
      await this._eventBus.publishAsync(new AppConfigLoadedEvent(config as AppConfig));
			
			this._logger.info('[LoadAppConfigUseCase] AppConfigLoadedEvent published');
		} catch (error) {
			this._logger.error('[LoadAppConfigUseCase] Failed to load app config', error);
			throw error;
		}
	}

  private _getAppIdFromEnvironment(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const fromQuery = url.searchParams.get('appId');
        if (fromQuery) return fromQuery;
      } catch {}
    }
    return process.env.NEXT_PUBLIC_APP_ID || null;
  }
}

