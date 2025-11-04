import { injectable, inject } from 'inversify';
import type { ConfigSubscriptionPort } from '../ports/config-subscription.port';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { UnsubscribeFn } from '../ports/config-subscription.port';

/**
 * Subscribe To Config Updates Use Case
 * Orchestrates real-time configuration subscription and event publishing
 * 
 * Flow:
 * 1. Subscribe to config changes via ConfigSubscriptionPort
 * 2. When config update received, publish AppConfigLoadedEvent through EventBus
 * 3. Store unsubscribe function for cleanup
 */
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

		// Subscribe to real-time config updates
		this.unsubscribeFn = this._configSubscription.subscribe(appId, async (config) => {
			this._logger.info('[SubscribeToConfigUpdatesUseCase] Config update received', {
				version: config.version,
				environment: config.environment,
			});

			// Publish event through EventBus so all modules can react
			await this._eventBus.publishAsync(new AppConfigLoadedEvent(config));
			this._logger.info('[SubscribeToConfigUpdatesUseCase] AppConfigLoadedEvent published');
		});

		this._logger.info('[SubscribeToConfigUpdatesUseCase] Successfully subscribed to config updates');
	}

	/**
	 * Clean up subscription
	 * Should be called on component unmount or when application is shutting down
	 */
	public cleanup(): void {
		if (this.unsubscribeFn) {
			this._logger.info('[SubscribeToConfigUpdatesUseCase] Cleaning up subscription');
			this.unsubscribeFn();
			this.unsubscribeFn = null;
		}
	}
}


