/**
 * App Config Events
 * Событие загрузки конфигурации приложения
 * Публикуется: при старте приложения
 * Слушают: все модули (для получения своих секций конфига)
 */

import type { Event } from '../../application/ports/event-bus.port';
import type { AppConfig } from '../config/app-config.types';

export class AppConfigLoadedEvent implements Event {
	public readonly id: string;
	public readonly type = 'AppConfigLoadedEvent';
	public readonly timestamp: Date;
	public readonly source = 'app';
	public readonly payload: {
		readonly config: AppConfig;
	};

	constructor(config: AppConfig) {
		this.id = crypto.randomUUID();
		this.timestamp = new Date();
		this.payload = {
			config
		};
	}
}

