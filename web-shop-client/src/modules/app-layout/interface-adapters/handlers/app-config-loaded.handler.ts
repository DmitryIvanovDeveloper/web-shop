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
			// Extract uiRenderer config, defaulting to empty object if modules don't exist
			const appLayoutConfig = event.payload?.config?.modules?.uiRenderer || {};

			this._logger.info('[AppLayoutConfigLoadedHandler] Extracted uiRenderer config', {
				hasConfig: !!appLayoutConfig,
				hasSidebar: !!(appLayoutConfig as any)?.sidebar,
				sidebarChildrenCount: (appLayoutConfig as any)?.sidebar?.layout?.children?.length || 0
			});

			// Always set configs, even if empty - this marks presenter as "ready"
			this._logger.info('[AppLayoutConfigLoadedHandler] Setting App Layout configs in presenter');
			this._presenter.setConfigs(appLayoutConfig as any);

			this._logger.info('[AppLayoutConfigLoadedHandler] App Layout configs successfully applied');
		} catch (error) {
			this._logger.error('[AppLayoutConfigLoadedHandler] Error handling event', error);
		}
	}
}

// Legacy export for backward compatibility
export const UIRendererAppConfigLoadedHandler = AppLayoutConfigLoadedHandler;
