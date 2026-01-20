import type { AppConfig } from '../../shared/config/app-config.types';


export type UnsubscribeFn = () => void;


export interface ConfigSubscriptionPort {
	
	subscribe(appId: string, callback: (config: AppConfig) => void): UnsubscribeFn;

	
	unsubscribe(): void;
}


