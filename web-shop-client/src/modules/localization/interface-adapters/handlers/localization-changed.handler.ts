import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../domain/events/localization-changed.event';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { LocalizationPresenter } from '../presenters/localization.presenter';

@injectable()
export class LocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(LOCALIZATION_TYPES.LocalizationPresenter)
    private readonly _localizationPresenter: LocalizationPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[LocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the localization presenter with the new language data
    this._localizationPresenter.updateFromEvent(
      event.translations,
      event.languageCode,
      event.direction
    );

    this._logger.debug('[LocalizationChangedEventHandler] Localization presenter updated');
  }
}
