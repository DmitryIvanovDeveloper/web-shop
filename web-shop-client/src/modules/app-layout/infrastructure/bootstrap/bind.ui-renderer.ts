import type { Container } from 'inversify';
import { SidebarRendererPresenter } from '../../interface-adapters/presenters/sidebar-renderer.presenter';
import { AppLayoutConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppLayoutLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { AppLayoutLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { APP_LAYOUT_TYPES } from './types';

export function bindAppLayout(container: Container): void {
    container
    .bind(APP_LAYOUT_TYPES.SidebarRendererPresenter)
    .to(SidebarRendererPresenter)
    .inSingletonScope();

    container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      APP_LAYOUT_TYPES.AppConfigLoadedEventHandler
    )
    .to(AppLayoutConfigLoadedHandler)
    .inTransientScope();

    container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(
      APP_LAYOUT_TYPES.LocalizationLoadedEventHandler
    )
    .to(AppLayoutLocalizationLoadedEventHandler)
    .inTransientScope();

    container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(
      APP_LAYOUT_TYPES.LocalizationChangedEventHandler
    )
    .to(AppLayoutLocalizationChangedEventHandler)
    .inTransientScope();
}

export const bindUIRenderer = bindAppLayout;


