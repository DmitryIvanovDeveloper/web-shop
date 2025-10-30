/**
 * App Config Loaded Handler
 * Обрабатывает событие загрузки app-config и передаёт данные в AuthPresenter
 * Событие: AppConfigLoadedEvent
 */

import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { AuthPresenter } from '../presenters/auth.presenter';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class AuthAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(AUTH_TYPES.AuthPresenter)
		private readonly _authPresenter: AuthPresenter,
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event.type === 'AppConfigLoadedEvent';
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[AuthAppConfigLoadedHandler] Received app config', {
			version: event.payload.config.version
		});

		const authConfig = event.payload.config.modules.authentication;
		const theme = event.payload.config.theme;

		this._authPresenter.setConfig({
			labels: authConfig.labels,
			settings: authConfig.settings,
			theme
		});

		this._logger.info('[AuthAppConfigLoadedHandler] Auth config set in presenter');
	}
}


