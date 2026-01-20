import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../domain/events/localization-loaded.event';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { LocalizationPresenter } from '../presenters/localization.presenter';

@injectable()
export class LocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(LOCALIZATION_TYPES.LocalizationPresenter)
    private readonly _localizationPresenter: LocalizationPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[LocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

        this._localizationPresenter.updateFromEvent(
      event.translations,
      event.languageCode,
      event.direction
    );

    this._logger.debug('[LocalizationLoadedEventHandler] Localization presenter updated');
  }
}
