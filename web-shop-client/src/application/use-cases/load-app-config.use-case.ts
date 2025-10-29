import { injectable, inject } from 'inversify';
import type { HttpClient } from '../ports/http-client.port';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { AppConfig } from '../../shared/config/app-config.types';

@injectable()
export class LoadAppConfigUseCase {
	constructor(
		@inject(TYPES.HttpClient)
		private readonly _httpClient: HttpClient,
		@inject(TYPES.EventBus)
		private readonly _eventBus: EventBus,
		@inject(TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public async execute(): Promise<void> {
		this._logger.info('[LoadAppConfigUseCase] Loading app configuration');

		try {
			const response = await this._httpClient.get<AppConfig>('/api/app-config');

			if (response.status !== 200 || !response.data) {
				throw new Error('Failed to load app config');
			}

			this._logger.info('[LoadAppConfigUseCase] App config loaded successfully', {
				version: response.data.version,
				environment: response.data.environment
			});

			// Publish event for all modules to consume
			await this._eventBus.publishAsync(new AppConfigLoadedEvent(response.data));
			
			this._logger.info('[LoadAppConfigUseCase] AppConfigLoadedEvent published');

			// Dispatch window event for UI components
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('appConfigLoaded'));
				this._logger.info('[LoadAppConfigUseCase] appConfigLoaded window event dispatched');
			}
		} catch (error) {
			this._logger.error('[LoadAppConfigUseCase] Failed to load app config', error);
			throw error;
		}
	}
}

