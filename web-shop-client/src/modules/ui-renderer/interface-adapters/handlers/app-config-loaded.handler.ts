import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';
import { UI_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class UIRendererAppConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(UI_RENDERER_TYPES.SidebarRendererPresenter)
		private readonly _presenter: SidebarRendererPresenter,
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event instanceof AppConfigLoadedEvent;
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[UIRendererAppConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			const uiRendererConfig = event.config.modules.uiRenderer;
			
			if (!uiRendererConfig) {
				this._logger.error('[UIRendererAppConfigLoadedHandler] UI Renderer config not found in AppConfig');
				return;
			}

			this._logger.info('[UIRendererAppConfigLoadedHandler] Setting UI Renderer configs in presenter');
			this._presenter.setConfigs(uiRendererConfig);
			
			this._logger.info('[UIRendererAppConfigLoadedHandler] UI Renderer configs successfully applied');
		} catch (error) {
			this._logger.error('[UIRendererAppConfigLoadedHandler] Error handling event', error);
		}
	}
}

