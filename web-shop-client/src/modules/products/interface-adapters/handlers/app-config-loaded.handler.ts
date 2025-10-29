/**
 * App Config Loaded Handler for Products Module
 * Обрабатывает событие загрузки app-config и передаёт shared стили для ProductCard
 */

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class ProductsAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event.type === 'AppConfigLoadedEvent';
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[ProductsAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			const sharedConfig = event.payload.config.shared;
			
			// Products использует OfferCard, но с productCardUI стилями (если они есть)
			// Если productCardUI нет, используем offerCardUI
			const cardStyles = sharedConfig?.productCardUI || sharedConfig?.offerCardUI;
			
			if (!cardStyles) {
				this._logger.warn('[ProductsAppConfigLoadedHandler] No card UI config found in shared config');
				return;
			}

			// Сохраняем стили в window для доступа из компонентов
			// Products будет использовать те же стили, что и offers (OfferCard компонент)
			if (typeof window !== 'undefined') {
				(window as any).__productCardStyles = cardStyles;
				this._logger.info('[ProductsAppConfigLoadedHandler] ProductCard styles applied to window');
			}
		} catch (error) {
			this._logger.error('[ProductsAppConfigLoadedHandler] Error handling event', error);
		}
	}
}

