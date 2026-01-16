import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { APP_LAYOUT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';

@injectable()
export class AppLayoutLocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(APP_LAYOUT_TYPES.SidebarRendererPresenter)
    private readonly _sidebarPresenter: SidebarRendererPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[AppLayoutLocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the sidebar presenter with the new translations
    this._sidebarPresenter.onTranslationsConfig(
      event.translations,
      event.languageCode,
      event.direction
    );

    this._logger.debug('[AppLayoutLocalizationChangedEventHandler] Sidebar presenter updated after language change');
  }
}


