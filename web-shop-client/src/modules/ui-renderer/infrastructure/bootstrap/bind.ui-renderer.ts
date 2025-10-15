import type { Container } from 'inversify';
import { UI_RENDERER_TYPES } from './types';
import { ConfigRepository } from '../repositories/config.repository';
import { LoadPageConfigUseCase } from '../../application/use-cases/load-page-config.use-case';
import { SidebarRendererPresenter } from '../../interface-adapters/presenters/sidebar-renderer.presenter';
import { ComponentRegistry } from '../services/component-registry.service';
import { StyleBuilder } from '../services/style-builder.service';

export function bindUIRenderer(container: Container): void {
  container
    .bind(UI_RENDERER_TYPES.ConfigRepository)
    .to(ConfigRepository)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.LoadPageConfigUseCase)
    .to(LoadPageConfigUseCase)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.SidebarRendererPresenter)
    .to(SidebarRendererPresenter)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.ComponentRegistry)
    .to(ComponentRegistry)
    .inSingletonScope();

  container
    .bind(UI_RENDERER_TYPES.StyleBuilder)
    .to(StyleBuilder)
    .inSingletonScope();
}

