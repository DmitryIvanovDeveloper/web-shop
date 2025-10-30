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

	public async execute(): Promise<void> {
		this._logger.info('[LoadAppConfigUseCase] Loading app configuration');

		try {
      const appId = this._getAppIdFromEnvironment();
      if (!appId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

      const config = await this._supabaseLoader.loadConfig(appId);
      if (!config) {
        throw new Error(`[LoadAppConfigUseCase] Failed to load active config from Supabase for appId: ${appId}`);
      }

      this._logger.info('[LoadAppConfigUseCase] App config loaded successfully (Supabase)', {
        version: config.version,
        environment: config.environment
      });

			// Publish event for all modules to consume
      await this._eventBus.publishAsync(new AppConfigLoadedEvent(config as AppConfig));
			
			this._logger.info('[LoadAppConfigUseCase] AppConfigLoadedEvent published');

			// Dispatch window event for UI components
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('appConfigLoaded'));
				this._logger.info('[LoadAppConfigUseCase] appConfigLoaded window event dispatched');
			}
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

