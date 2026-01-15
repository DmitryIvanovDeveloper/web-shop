import type { Container } from 'inversify';
import { UI_RENDERER_TYPES } from './types';
import { SidebarRendererPresenter } from '../../interface-adapters/presenters/sidebar-renderer.presenter';
import { ComponentRegistry } from '../services/component-registry.service';
import { StyleBuilder } from '../services/style-builder.service';
import { ActionHandler } from '../services/action-handler.service';
import { UIRendererAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { UIRendererTranslationsConfigHandler } from '../../interface-adapters/handlers/translations-config.handler';
import { UIRendererLanguageChangedHandler } from '../../interface-adapters/handlers/language-changed.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { TranslationsConfigEvent } from '../../../localization/domain/events/translations-config.event';
import { LanguageChangedEvent } from '../../../localization/domain/events/language-changed.event';
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
      UI_RENDERER_TYPES.AppConfigLoadedEventHandler
    )
    .to(UIRendererAppConfigLoadedHandler)
    .inTransientScope();

  // Event Handler для TranslationsConfigEvent (перевод интерфейса при смене языка)
  container
    .bind<IAsyncEventHandler<TranslationsConfigEvent>>(
      UI_RENDERER_TYPES.TranslationsConfigEventHandler
    )
    .to(UIRendererTranslationsConfigHandler)
    .inTransientScope();

  // Event Handler для LanguageChangedEvent (форсированный re-render sidebar при смене языка)
  container
    .bind<IAsyncEventHandler<LanguageChangedEvent>>(
      UI_RENDERER_TYPES.LanguageChangedEventHandler
    )
    .to(UIRendererLanguageChangedHandler)
    .inTransientScope();
}


