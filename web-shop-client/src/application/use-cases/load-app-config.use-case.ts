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

	public async execute(isDraft?: boolean, appId?: string): Promise<void> {
		const shouldLoadDraft = typeof isDraft === 'boolean'
			? isDraft
			: this._shouldLoadDraftFromEnvironment();

		this._logger.info('[LoadAppConfigUseCase] Loading app configuration', {
			isDraft: shouldLoadDraft,
			source: typeof isDraft === 'boolean' ? 'argument' : 'query',
		});

		try {
      const resolvedAppId = appId || this._getAppIdFromEnvironment();
      if (!resolvedAppId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

			// Use shouldLoadDraft to determine which config to load
			let config: AppConfig | null = null;

			if (shouldLoadDraft) {
				config = await this._supabaseLoader.loadDraftConfig(resolvedAppId);
				if (!config) {
					this._logger.warn('[LoadAppConfigUseCase] Draft config not found, trying active as fallback', { appId: resolvedAppId });
					config = await this._supabaseLoader.loadConfig(resolvedAppId);
				}
			} else {
				config = await this._supabaseLoader.loadConfig(resolvedAppId);

				// If active config not found, try to load draft as fallback (for UI Builder preview mode)
				if (!config) {
					this._logger.warn('[LoadAppConfigUseCase] Active config not found, trying draft as fallback', { appId: resolvedAppId });
					config = await this._supabaseLoader.loadDraftConfig(resolvedAppId);
				}
			}

      if (!config) {
				const configType = shouldLoadDraft ? 'draft' : 'active';
        throw new Error(`[LoadAppConfigUseCase] Failed to load ${configType} config from Supabase for appId: ${resolvedAppId}`);
      }

      this._logger.info('[LoadAppConfigUseCase] App config loaded successfully (Supabase)', {
        version: config.version,
        environment: config.environment,
				isDraft: shouldLoadDraft,
				hasModules: !!config.modules,
				hasUIRenderer: !!config.modules?.uiRenderer,
				hasSidebar: !!config.modules?.uiRenderer?.sidebar,
				sidebarChildrenCount: config.modules?.uiRenderer?.sidebar?.layout?.children?.length || 0
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
        // Support both 'appId' and 'app' query parameters
        const fromQuery = url.searchParams.get('appId') || url.searchParams.get('app');
        if (fromQuery) return fromQuery;
      } catch {}
    }
    return process.env.NEXT_PUBLIC_APP_ID || null;
  }

	private _shouldLoadDraftFromEnvironment(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		try {
			const url = new URL(window.location.href);
			const draftParams = ['previewMode', 'pagePreview', 'uibuilder'];
			return draftParams.some((param) => url.searchParams.get(param) === 'true');
		} catch {
			return false;
		}
	}
}

