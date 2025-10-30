import type { AppConfig } from '../../shared/config/app-config.types';

/**
 * Unsubscribe function returned from subscription
 */
export type UnsubscribeFn = () => void;

/**
 * Config Subscription Port
 * Defines the contract for subscribing to real-time configuration updates
 * Following Clean Architecture: Port in Application Layer, Adapter in Infrastructure
 */
export interface ConfigSubscriptionPort {
	/**
	 * Subscribe to configuration updates for a specific app
	 * @param appId - The application ID to subscribe to
	 * @param callback - Function called when configuration changes
	 * @returns Function to unsubscribe from updates
	 */
	subscribe(appId: string, callback: (config: AppConfig) => void): UnsubscribeFn;

	/**
	 * Unsubscribe from all active subscriptions
	 */
	unsubscribe(): void;
}

