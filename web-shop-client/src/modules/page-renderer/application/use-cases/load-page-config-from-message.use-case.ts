import { injectable, inject } from 'inversify';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';
import type { PageConfig } from '../../domain/entities/page-config.entity';

/**
 * Load Page Config From Message Use Case
 * Handles PageConfig loaded from UI Builder via postMessage
 * 
 * Flow:
 * 1. Receives config from UI Builder (via postMessage)
 * 2. Publishes PageConfigLoadedEvent through EventBus
 * 3. Handler receives event and updates presenter
 */
@injectable()
export class LoadPageConfigFromMessageUseCase {
  constructor(
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(
    pageConfig: PageConfig,
    appId: string,
    pageSlug: string
  ): Promise<void> {
    this._logger.info('[LoadPageConfigFromMessageUseCase] Processing config from message', {
      appId,
      pageSlug,
      sectionsCount: pageConfig?.sections?.length || 0,
    });

    try {
      // Publish event for handler to consume -> presenter
      await this._eventBus.publishAsync(
        new PageConfigLoadedEvent(pageConfig, appId, pageSlug)
      );

      this._logger.info('[LoadPageConfigFromMessageUseCase] PageConfigLoadedEvent published');
    } catch (error) {
      this._logger.error('[LoadPageConfigFromMessageUseCase] Failed to process config from message', error);
      throw error;
    }
  }
}




