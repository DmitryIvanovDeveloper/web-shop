/**
 * App Config Events
 * Событие загрузки конфигурации приложения
 * Публикуется: при старте приложения
 * Слушают: все модули (для получения своих секций конфига)
 */

import { IEvent } from '../../application/ports/event-bus.port';
import type { AppConfig } from '../config/app-config.types';

export class AppConfigLoadedEvent implements IEvent {
	public readonly type = 'AppConfigLoadedEvent';

	constructor(public readonly config: AppConfig) {}
}

