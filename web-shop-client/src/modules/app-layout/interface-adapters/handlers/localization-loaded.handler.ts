import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { APP_LAYOUT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';

@injectable()
export class AppLayoutLocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(APP_LAYOUT_TYPES.SidebarRendererPresenter)
    private readonly _sidebarPresenter: SidebarRendererPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[AppLayoutLocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

        this._sidebarPresenter.onTranslationsConfig(
      event.translations,
      event.languageCode,
      event.direction
    );

    this._logger.debug('[AppLayoutLocalizationLoadedEventHandler] Sidebar presenter updated after localization load');
  }
}


