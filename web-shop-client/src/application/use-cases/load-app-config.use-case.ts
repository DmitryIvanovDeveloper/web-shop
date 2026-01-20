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
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger,
    @inject(TYPES.SupabaseConfigLoader)
    private readonly _supabaseLoader: SupabaseConfigLoader
  ) { }

  public async execute(isDraft?: boolean, appId?: string): Promise<void> {
    let shouldLoadDraft = typeof isDraft === 'boolean'
      ? isDraft
      : this._shouldLoadDraftFromEnvironment();

    const isUIBuilderMode = this._isUIBuilderMode();
    if (isUIBuilderMode) {
      shouldLoadDraft = true;
    }

    try {
      if (!appId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

      let config: AppConfig | null = null;

      if (shouldLoadDraft) {
        config = await this._supabaseLoader.loadDraftConfig(appId);

        if (!config && !isUIBuilderMode) {
          config = await this._supabaseLoader.loadConfig(appId);
        }
      } else {
        config = await this._supabaseLoader.loadConfig(appId);

        if (!config) {
          config = await this._supabaseLoader.loadDraftConfig(appId);
        }
      }

      if (!config) {
        const configType = shouldLoadDraft ? 'draft' : 'active';
        throw new Error(
          `[LoadAppConfigUseCase] ${configType} config not found for appId: ${appId}`
        );
      }

      await this._eventBus.publishAsync(new AppConfigLoadedEvent(config as AppConfig));
    } catch (error) {
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

