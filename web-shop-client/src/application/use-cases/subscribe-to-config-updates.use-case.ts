import { injectable, inject } from 'inversify';
import type { ConfigSubscriptionPort, UnsubscribeFn } from '../ports/config-subscription.port';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';


@injectable()
export class SubscribeToConfigUpdatesUseCase {
	private unsubscribeFn: UnsubscribeFn | null = null;

	constructor(
		@inject(TYPES.ConfigSubscriptionPort)
		private readonly _configSubscription: ConfigSubscriptionPort,
		@inject(TYPES.EventBus)
		private readonly _eventBus: EventBus,
		@inject(TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public async execute(appId: string): Promise<void> {
		this._logger.info('[SubscribeToConfigUpdatesUseCase] Starting config subscription', { appId });

				this.unsubscribeFn = this._configSubscription.subscribe(appId, async (config) => {
			this._logger.info('[SubscribeToConfigUpdatesUseCase] Config update received', {
				version: config.version,
				environment: config.environment,
			});

						await this._eventBus.publishAsync(new AppConfigLoadedEvent(config));
			this._logger.info('[SubscribeToConfigUpdatesUseCase] AppConfigLoadedEvent published');
		});

		this._logger.info('[SubscribeToConfigUpdatesUseCase] Successfully subscribed to config updates');
	}

	
	public cleanup(): void {
		if (this.unsubscribeFn) {
			this._logger.info('[SubscribeToConfigUpdatesUseCase] Cleaning up subscription');
			this.unsubscribeFn();
			this.unsubscribeFn = null;
		}
	}
}


