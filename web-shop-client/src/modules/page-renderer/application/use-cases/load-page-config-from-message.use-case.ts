import { injectable, inject } from 'inversify';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';
import type { PageConfig } from '../../domain/entities/page-config.entity';


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
      sections: pageConfig?.sections?.map(s => ({ id: s.id, type: s.type, componentsCount: s.components?.length || 0 })) || []
    });

    try {
            const event = new PageConfigLoadedEvent(pageConfig, appId, pageSlug);
      this._logger.info('[LoadPageConfigFromMessageUseCase] Publishing PageConfigLoadedEvent', {
        eventName: event.eventName,
        sectionsCount: pageConfig?.sections?.length || 0
      });
      
      await this._eventBus.publishAsync(event);

      this._logger.info('[LoadPageConfigFromMessageUseCase] PageConfigLoadedEvent published successfully');
    } catch (error) {
      this._logger.error('[LoadPageConfigFromMessageUseCase] Failed to process config from message', error);
      throw error;
    }
  }
}




