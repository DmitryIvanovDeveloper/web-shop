import { injectable, inject } from 'inversify';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { SidebarRendererPresenter } from '../presenters/sidebar-renderer.presenter';
import { APP_LAYOUT_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class AppLayoutConfigLoadedHandler implements IAsyncEventHandler<AppConfigLoadedEvent> {
	constructor(
		@inject(APP_LAYOUT_TYPES.SidebarRendererPresenter)
		private readonly _presenter: SidebarRendererPresenter,
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public canHandle(event: AppConfigLoadedEvent): boolean {
		return event instanceof AppConfigLoadedEvent;
	}

	public async handleAsync(event: AppConfigLoadedEvent): Promise<void> {
		this._logger.info('[AppLayoutConfigLoadedHandler] Processing AppConfigLoadedEvent');

		try {
			// Check if config and modules exist
			if (!event.payload?.config?.modules) {
				this._logger.warn('[AppLayoutConfigLoadedHandler] Config modules not found in AppConfig');
				return;
			}

			const appLayoutConfig = event.payload.config.modules.uiRenderer;
			
			if (!appLayoutConfig) {
				this._logger.warn('[AppLayoutConfigLoadedHandler] App Layout config (uiRenderer) not found in AppConfig');
				return;
			}

			this._logger.info('[AppLayoutConfigLoadedHandler] Setting App Layout configs in presenter');
			this._presenter.setConfigs(appLayoutConfig);
			
			this._logger.info('[AppLayoutConfigLoadedHandler] App Layout configs successfully applied');
		} catch (error) {
			this._logger.error('[AppLayoutConfigLoadedHandler] Error handling event', error);
		}
	}
}

// Legacy export for backward compatibility
export const UIRendererAppConfigLoadedHandler = AppLayoutConfigLoadedHandler;

