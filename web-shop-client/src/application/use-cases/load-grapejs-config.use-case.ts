import { injectable, inject } from 'inversify';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import type { GrapeJsAppConfig } from '../../shared/config/grapejs-app-config.types';
import type { SupabaseConfigLoader } from '../../infrastructure/config/supabase-config-loader';

export class GrapeJsConfigLoadedEvent {
	public readonly type = 'GrapeJsConfigLoadedEvent';

	constructor(public readonly config: GrapeJsAppConfig, public readonly appId: string) {}
}

@injectable()
export class LoadGrapeJsConfigUseCase {
  constructor(
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger,
    @inject(TYPES.SupabaseConfigLoader)
    private readonly _supabaseLoader: SupabaseConfigLoader
  ) { }

  public async execute(isDraft?: boolean, appId?: string): Promise<GrapeJsAppConfig> {
    console.log('[LoadGrapeJsConfigUseCase] Execute called', { isDraft, appId });

    if (!appId) {
      throw new Error('[LoadGrapeJsConfigUseCase] appId is required but was not provided');
    }

    let shouldLoadDraft = typeof isDraft === 'boolean'
      ? isDraft
      : this._shouldLoadDraftFromEnvironment();

    const isUIBuilderMode = this._isUIBuilderMode();
    if (isUIBuilderMode) {
      shouldLoadDraft = true;
    }

    console.log('[LoadGrapeJsConfigUseCase] Config load parameters', {
      shouldLoadDraft,
      isUIBuilderMode,
      appId
    });

    try {
      let config: GrapeJsAppConfig | null = null;

      console.log('[LoadGrapeJsConfigUseCase] Loading config', { shouldLoadDraft });

      if (shouldLoadDraft) {
        console.log('[LoadGrapeJsConfigUseCase] Loading draft config');
        config = await this._supabaseLoader.loadDraftConfig(appId);

        if (!config && !isUIBuilderMode) {
          console.log('[LoadGrapeJsConfigUseCase] Draft config not found, loading active config');
          config = await this._supabaseLoader.loadConfig(appId);
        }
      } else {
        console.log('[LoadGrapeJsConfigUseCase] Loading active config');
        config = await this._supabaseLoader.loadConfig(appId);

        if (!config) {
          console.log('[LoadGrapeJsConfigUseCase] Active config not found, loading draft config');
          config = await this._supabaseLoader.loadDraftConfig(appId);
        }
      }

      if (!config) {
        const configType = shouldLoadDraft ? 'draft' : 'active';
        throw new Error(
          `[LoadGrapeJsConfigUseCase] ${configType} config not found for appId: ${appId}`
        );
      }

      console.log('[LoadGrapeJsConfigUseCase] Config loaded successfully', {
        hasConfig: !!config,
        configType: shouldLoadDraft ? 'draft' : 'active',
        pagesCount: config.pages?.length || 0,
        stylesCount: config.styles?.length || 0
      });

      // Публикуем событие о загрузке GrapeJS конфигурации
      const event = new GrapeJsConfigLoadedEvent(config, appId);
      await this._eventBus.publishAsync(event);

      console.log('[LoadGrapeJsConfigUseCase] GrapeJS config load completed successfully');

      return config;
    } catch (error) {
      console.error('[LoadGrapeJsConfigUseCase] Error during config load', error);
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