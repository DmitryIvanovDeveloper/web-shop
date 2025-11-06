import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { PageRendererPresenter } from '../presenters/page-renderer.presenter';
import { PAGE_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

/**
 * PageRenderer AppConfigLoaded Handler
 * Обновляет offerCards в PageRendererPresenter при получении AppConfigLoadedEvent
 * 
 * Flow:
 * 1. Получает AppConfigLoadedEvent через EventBus
 * 2. Извлекает offerCards из config.config.offerCards (AppConfigStructure)
 * 3. Обновляет PageRendererPresenter через setOfferCards()
 */
@injectable()
export class PageRendererAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(PAGE_RENDERER_TYPES.PageRendererPresenter)
		private readonly _presenter: PageRendererPresenter,
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event instanceof AppConfigLoadedEvent;
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[PageRendererAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			// Extract offerCards from config.config.offerCards (AppConfigStructure)
			// Type assertion needed because AppConfig type doesn't include offerCards
			const appConfigStructure = (event.payload.config as any)?.config;
			const offerCards = appConfigStructure?.offerCards;

			if (offerCards && Array.isArray(offerCards)) {
				this._logger.info('[PageRendererAppConfigLoadedHandler] Found offerCards in config', {
					count: offerCards.length
				});
				this._presenter.setOfferCards(offerCards);
			} else {
				this._logger.debug('[PageRendererAppConfigLoadedHandler] No offerCards found in config');
			}
		} catch (error) {
			this._logger.error('[PageRendererAppConfigLoadedHandler] Error handling event', error);
		}
	}
}


