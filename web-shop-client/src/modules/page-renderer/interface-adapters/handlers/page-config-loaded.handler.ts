import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import type { Logger } from '../../../../application/ports/logger.port';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';
import { PageRendererPresenter } from '../presenters/page-renderer.presenter';
import { PAGE_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class PageConfigLoadedHandler implements IAsyncEventHandler<PageConfigLoadedEvent> {
  constructor(
    @inject(PAGE_RENDERER_TYPES.PageRendererPresenter) 
    private readonly _presenter: PageRendererPresenter,
    @inject(ROOT_TYPES.Logger) 
    private readonly _logger: Logger
  ) {}

  canHandle(event: PageConfigLoadedEvent): boolean {
    return event.eventName === 'PageConfigLoadedEvent';
  }

  async handleAsync(event: PageConfigLoadedEvent): Promise<void> {
    this._logger.info('[PageConfigLoadedHandler] Received event', {
      appId: event.appId,
      pageSlug: event.pageSlug,
      hasConfig: !!event.pageConfig,
      sectionsCount: event.pageConfig?.sections?.length || 0
    });
    
    this._presenter.setPageConfig(event.pageConfig);
    
    this._logger.info('[PageConfigLoadedHandler] Page config set in presenter', {
      sectionsCount: event.pageConfig?.sections?.length || 0
    });
  }
}

