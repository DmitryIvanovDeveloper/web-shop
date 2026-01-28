import { injectable, inject } from 'inversify';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { GrapeJsAppConfig } from '../../shared/config/grapejs-app-config.types';
import { GrapeJsToLegacyAdapter } from '../../shared/adapters/grapejs-to-legacy.adapter';
import type { SupabaseConfigLoader } from '../../infrastructure/config/supabase-config-loader';

@injectable()
export class LoadAppConfigUseCase {
  constructor(
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger,
    @inject(TYPES.SupabaseConfigLoader)
    private readonly _supabaseLoader: SupabaseConfigLoader
  ) { }

  public async execute(isDraft?: boolean, appId?: string): Promise<void> {
    console.log('[LoadAppConfigUseCase] Execute called', { isDraft, appId });

    let shouldLoadDraft = typeof isDraft === 'boolean'
      ? isDraft
      : this._shouldLoadDraftFromEnvironment();

    const isUIBuilderMode = this._isUIBuilderMode();
    if (isUIBuilderMode) {
      shouldLoadDraft = true;
    }

    console.log('[LoadAppConfigUseCase] Config load parameters', {
      shouldLoadDraft,
      isUIBuilderMode,
      appId
    });

    try {
      if (!appId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

      let config: GrapeJsAppConfig | null = null;

      console.log('[LoadAppConfigUseCase] Loading config', { shouldLoadDraft });

      if (shouldLoadDraft) {
        console.log('[LoadAppConfigUseCase] Loading draft config');
        config = await this._supabaseLoader.loadDraftConfig(appId);

        if (!config && !isUIBuilderMode) {
          console.log('[LoadAppConfigUseCase] Draft config not found, loading active config');
          config = await this._supabaseLoader.loadConfig(appId);
        }
      } else {
        console.log('[LoadAppConfigUseCase] Loading active config');
        config = await this._supabaseLoader.loadConfig(appId);

        if (!config) {
          console.log('[LoadAppConfigUseCase] Active config not found, loading draft config');
          config = await this._supabaseLoader.loadDraftConfig(appId);
        }
      }

      if (!config) {
        const configType = shouldLoadDraft ? 'draft' : 'active';
        throw new Error(
          `[LoadAppConfigUseCase] ${configType} config not found for appId: ${appId}`
        );
      }

      console.log('[LoadAppConfigUseCase] Config loaded successfully', {
        hasConfig: !!config,
        configType: shouldLoadDraft ? 'draft' : 'active',
        pagesCount: config.pages?.length || 0,
        stylesCount: config.styles?.length || 0
      });

      // Преобразуем GrapeJS данные в совместимый формат AppConfig
      console.log('[LoadAppConfigUseCase] Converting GrapeJS config to legacy format');
      const legacyConfig = GrapeJsToLegacyAdapter.convert(config);
      console.log('[LoadAppConfigUseCase] Legacy config created', {
        hasTheme: !!legacyConfig.theme,
        hasModules: !!legacyConfig.modules,
        modulesKeys: legacyConfig.modules ? Object.keys(legacyConfig.modules) : [],
        offerCardsCount: (legacyConfig as any)?.offerCards?.length || 0
      });

      console.log('[LoadAppConfigUseCase] Publishing AppConfigLoadedEvent');
      const event = new AppConfigLoadedEvent(legacyConfig);
      console.log('[LoadAppConfigUseCase] Event created', { eventType: event.type });
      await this._eventBus.publishAsync(event);

      console.log('[LoadAppConfigUseCase] Config load completed successfully');
    } catch (error) {
      console.error('[LoadAppConfigUseCase] Error during config load', error);
      throw error;
    }
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

  private _isUIBuilderMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const url = new URL(window.location.href);
      return url.searchParams.get('uibuilder') === 'true';
    } catch {
      return false;
    }
  }
}

