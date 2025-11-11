/**
 * App Config Loaded Handler for Offers Module
 * Обрабатывает событие загрузки app-config и передаёт shared стили для OfferCard
 */

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class OffersAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event.type === 'AppConfigLoadedEvent';
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[OffersAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			const sharedConfig = event.payload.config.shared;
			
			if (!sharedConfig?.offerCardUI) {
				this._logger.warn('[OffersAppConfigLoadedHandler] OfferCard UI config not found in shared config');
				return;
			}

			// Сохраняем стили в window для доступа из компонентов
			if (typeof window !== 'undefined') {
				(window as any).__offerCardStyles = sharedConfig.offerCardUI;
				this._logger.info('[OffersAppConfigLoadedHandler] OfferCard styles applied to window');
			}
		} catch (error) {
			this._logger.error('[OffersAppConfigLoadedHandler] Error handling event', error);
		}
	}
}











