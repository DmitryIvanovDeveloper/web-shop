/**
 * App Config Loaded Handler for Products Module
 * Обрабатывает событие загрузки app-config и передаёт shared стили для ProductCard
 */

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';
import { ProductsListPresenter } from '../presenters/products-list.presenter';

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
		this._logger.info('[ProductsAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			const sharedConfig = event.payload.config.shared;
			const cardStyles = sharedConfig?.productCardUI || sharedConfig?.offerCardUI;
			
			if (!cardStyles) {
				this._logger.warn('[ProductsAppConfigLoadedHandler] No card UI config found in shared config');
				this._productStyleService.applyAppConfigStyles(null);
				await this._productsListPresenter.refreshStyles();
				return;
			}

			this._productStyleService.applyAppConfigStyles(cardStyles);
			await this._productsListPresenter.refreshStyles();
			this._logger.info('[ProductsAppConfigLoadedHandler] App-config styles applied to products list');
		} catch (error) {
			this._logger.error('[ProductsAppConfigLoadedHandler] Error handling event', error);
		}
	}
}

