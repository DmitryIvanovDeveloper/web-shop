import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { OffersListPresenter } from '../presenters/offers-list.presenter';

@injectable()
export class OffersLocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(OFFERS_TYPES.OffersListPresenter)
    private readonly _offersPresenter: OffersListPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[OffersLocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

        this._offersPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[OffersLocalizationChangedEventHandler] Offers presenter labels updated after language change');
  }
}



