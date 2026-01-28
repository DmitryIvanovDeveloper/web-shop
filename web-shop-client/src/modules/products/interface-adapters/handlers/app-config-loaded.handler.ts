

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';
import { ProductsListPresenter } from '../presenters/products-list.presenter';
import type { OfferCardTemplate } from '../../../../shared/config/app-config.types';

const PRIMARY_OFFER_CARD_ID = 'offer-card-1762760704585';

@injectable()
export class ProductsAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger,
		@inject(PRODUCTS_TYPES.ProductStyleService)
		private readonly _productStyleService: ProductStyleService,
		@inject(PRODUCTS_TYPES.ProductsListPresenter)
		private readonly _productsListPresenter: ProductsListPresenter,
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event.type === 'AppConfigLoadedEvent';
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		console.log('[ProductsAppConfigLoadedHandler] Handler called!', {
			eventType: event.type,
			hasConfig: !!event.config,
			configKeys: event.config ? Object.keys(event.config) : [],
			hasOfferCards: !!(event.config as any)?.offerCards
		});
		this._logger.info('[ProductsAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			const offerCards = Array.isArray((event.config as { offerCards?: OfferCardTemplate[] })?.offerCards)
				? ((event.config as { offerCards?: OfferCardTemplate[] }).offerCards as OfferCardTemplate[])
				: [];

			console.log('[ProductsAppConfigLoadedHandler] Extracted offerCards', {
				offerCardsCount: offerCards.length,
				offerCardIds: offerCards.map(card => card.id),
				lookingFor: PRIMARY_OFFER_CARD_ID
			});

			const matchingCard =
				offerCards.find(card => card.id === PRIMARY_OFFER_CARD_ID) ??
				offerCards[0] ??
				null;

			if (!matchingCard) {
				this._logger.warn('[ProductsAppConfigLoadedHandler] No offer cards available for products styling');
				this._productStyleService.applyAppConfigStyles(null);
				await this._productsListPresenter.refreshStyles();
				return;
			}

			if (matchingCard.id !== PRIMARY_OFFER_CARD_ID) {
				this._logger.warn('[ProductsAppConfigLoadedHandler] Primary offer card not found, using first available', {
					fallbackCardId: matchingCard.id,
					availableIds: offerCards.map(card => card.id),
				});
			}

			this._productStyleService.applyAppConfigStyles(matchingCard);
			await this._productsListPresenter.refreshStyles();
			console.log('[ProductsAppConfigLoadedHandler] Styles applied successfully', {
				matchingCardId: matchingCard.id,
				matchingCardName: matchingCard.name
			});
			this._logger.info('[ProductsAppConfigLoadedHandler] App-config styles applied from offerCards array', {
				cardId: matchingCard.id,
				cardName: matchingCard.name
			});
		} catch (error) {
			console.error('[ProductsAppConfigLoadedHandler] Exception during handling', error);
			this._logger.error('[ProductsAppConfigLoadedHandler] Error handling event', error);
		}
	}
}

