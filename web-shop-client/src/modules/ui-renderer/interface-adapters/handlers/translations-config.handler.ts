import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { TranslationsConfigEvent } from '@/modules/localization/domain/events/translations-config.event';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';
import { UI_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class UIRendererTranslationsConfigHandler implements IAsyncEventHandler<TranslationsConfigEvent> {
  constructor(
    @inject(UI_RENDERER_TYPES.SidebarRendererPresenter)
    private readonly _sidebarRendererPresenter: SidebarRendererPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: TranslationsConfigEvent): boolean {
    return event.type === 'TranslationsConfigEvent';
  }

  public async handleAsync(event: TranslationsConfigEvent): Promise<void> {
    this._logger.info('[UIRendererTranslationsConfigHandler] Translations config event received, notifying sidebar listeners', {
      languageCode: event.languageCode.value
    });

            this._sidebarRendererPresenter.notifyListeners();

    this._logger.info('[UIRendererTranslationsConfigHandler] Sidebar listeners notified successfully');
  }
}
