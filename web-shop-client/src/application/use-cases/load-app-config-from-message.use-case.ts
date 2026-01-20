import { injectable, inject } from 'inversify';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { AppConfig } from '../../shared/config/app-config.types';


@injectable()
export class LoadAppConfigFromMessageUseCase {
	constructor(
		@inject(TYPES.EventBus)
		private readonly _eventBus: EventBus,
		@inject(TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public async execute(config: AppConfig): Promise<void> {
		this._logger.info('[LoadAppConfigFromMessageUseCase] Processing config from message', {
			version: config.version,
			environment: config.environment,
		});

		try {
						await this._eventBus.publishAsync(new AppConfigLoadedEvent(config));

			this._logger.info('[LoadAppConfigFromMessageUseCase] AppConfigLoadedEvent published');
		} catch (error) {
			this._logger.error('[LoadAppConfigFromMessageUseCase] Failed to process config from message', error);
			throw error;
		}
	}
}

