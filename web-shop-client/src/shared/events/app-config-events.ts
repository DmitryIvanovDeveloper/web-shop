

import type { IEvent } from '../../application/ports/event-bus.port';
import type { AppConfig } from '../config/app-config.types';

export class AppConfigLoadedEvent implements IEvent {
	public readonly type = 'AppConfigLoadedEvent';

	constructor(public readonly config: AppConfig) {}
}

