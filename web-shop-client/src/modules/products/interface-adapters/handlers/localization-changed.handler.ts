import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { ProductsListPresenter } from '../presenters/products-list.presenter';

@injectable()
export class ProductsLocalizationChangedEventHandler implements IAsyncEventHandler<LocalizationChangedEvent> {
  constructor(
    @inject(PRODUCTS_TYPES.ProductsListPresenter)
    private readonly _productsPresenter: ProductsListPresenter,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public canHandle(event: LocalizationChangedEvent): boolean {
    return event.type === 'LocalizationChangedEvent';
  }

  public async handleAsync(event: LocalizationChangedEvent): Promise<void> {
    this._logger.info('[ProductsLocalizationChangedEventHandler] Localization changed event received', {
      languageCode: event.languageCode,
      direction: event.direction,
      translationsCount: Object.keys(event.translations).length
    });

    // Update the products presenter with the new translations
    this._productsPresenter.updateLabelsFromTranslations(event.translations);

    this._logger.debug('[ProductsLocalizationChangedEventHandler] Products presenter labels updated after language change');
  }
}



