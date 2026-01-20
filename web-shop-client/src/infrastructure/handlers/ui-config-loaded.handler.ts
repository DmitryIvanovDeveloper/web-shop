import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { Logger } from '../../application/ports/logger.port';
import { ROOT_TYPES } from '../bootstrap/types';


@injectable()
export class UIConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event instanceof AppConfigLoadedEvent;
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[UIConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
						if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('appConfigLoaded'));
				this._logger.info('[UIConfigLoadedHandler] appConfigLoaded window event dispatched');
			}
		} catch (error) {
			this._logger.error('[UIConfigLoadedHandler] Error dispatching window event', error);
		}
	}
}

