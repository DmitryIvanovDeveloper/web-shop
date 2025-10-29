import type { Container } from 'inversify';
import { UI_RENDERER_TYPES } from './types';
import { SidebarRendererPresenter } from '../../interface-adapters/presenters/sidebar-renderer.presenter';
import { ComponentRegistry } from '../services/component-registry.service';
import { StyleBuilder } from '../services/style-builder.service';
import { ActionHandler } from '../services/action-handler.service';
import { UIRendererAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';

export function bindUIRenderer(container: Container): void {
  // Presenter
  container
    .bind(UI_RENDERER_TYPES.SidebarRendererPresenter)
    .to(SidebarRendererPresenter)
    .inSingletonScope();

  // Module-specific Services (для DynamicRenderer модуля)
  container
    .bind(UI_RENDERER_TYPES.ComponentRegistry)
    .to(ComponentRegistry)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.StyleBuilder)
    .to(StyleBuilder)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.ActionHandler)
    .to(ActionHandler)
    .inSingletonScope();

  // Event Handler для AppConfigLoadedEvent (получение конфига при старте)
  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>')
    )
    .to(UIRendererAppConfigLoadedHandler)
    .inTransientScope();
}


