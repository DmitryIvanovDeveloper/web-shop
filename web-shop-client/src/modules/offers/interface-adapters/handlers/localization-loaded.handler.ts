import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { OffersListPresenter } from '../presenters/offers-list.presenter';

@injectable()
export class OffersLocalizationLoadedEventHandler implements IAsyncEventHandler<LocalizationLoadedEvent> {
  constructor(
    @inject(OFFERS_TYPES.OffersListPresenter)
    private readonly _offersPresenter: OffersListPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationLoadedEvent): boolean {
    return event.type === 'LocalizationLoadedEvent';
  }

  public async handleAsync(event: LocalizationLoadedEvent): Promise<void> {
    this._logger.info('[OffersLocalizationLoadedEventHandler] Localization loaded event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

        this._offersPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[OffersLocalizationLoadedEventHandler] Offers presenter labels updated');
  }
}
