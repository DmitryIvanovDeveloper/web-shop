import type { Container } from 'inversify';
import { APP_LAYOUT_TYPES } from './types';
import { SidebarRendererPresenter } from '../../interface-adapters/presenters/sidebar-renderer.presenter';
import { AppLayoutConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';

export function bindAppLayout(container: Container): void {
  // Presenter
  container
    .bind(APP_LAYOUT_TYPES.SidebarRendererPresenter)
    .to(SidebarRendererPresenter)
    .inSingletonScope();

  // Event Handler для AppConfigLoadedEvent (получение конфига при старте)
  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>')
    )
    .to(AppLayoutConfigLoadedHandler)
    .inTransientScope();
}

// Legacy export for backward compatibility
export const bindUIRenderer = bindAppLayout;


