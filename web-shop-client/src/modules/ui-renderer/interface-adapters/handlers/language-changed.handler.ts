import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';
import { UI_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';
import { LanguageChangedEvent } from '@/modules/localization/domain';

@injectable()
export class UIRendererLanguageChangedHandler implements IAsyncEventHandler<LanguageChangedEvent> {
  constructor(
    @inject(UI_RENDERER_TYPES.SidebarRendererPresenter)
    private readonly _sidebarRendererPresenter: SidebarRendererPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LanguageChangedEvent): boolean {
    return event.type === 'LanguageChangedEvent';
  }

  public async handleAsync(event: LanguageChangedEvent): Promise<void> {
        this._logger.info('[UIRendererLanguageChangedHandler] Language changed event received, updating sidebar presenter', {
      languageCode: event.languageCode.value,
      direction: event.direction.value,
      previousLanguageCode: event.previousLanguageCode?.value
    });

                this._sidebarRendererPresenter.onLanguageChanged(
      event.languageCode.value,
      event.direction.value
    );

    this._logger.info('[UIRendererLanguageChangedHandler] Sidebar presenter updated successfully');
      }
}
