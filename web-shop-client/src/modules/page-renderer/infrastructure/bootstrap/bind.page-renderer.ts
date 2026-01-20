import type { Container } from 'inversify';
import type { PageConfigRepositoryPort } from '../../application/ports/page-config-repository.port';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { SupabasePageConfigRepository } from '../repositories/supabase-page-config.repository';
import { LoadPageConfigUseCase } from '../../application/use-cases/load-page-config.use-case';
import { LoadPageConfigFromMessageUseCase } from '../../application/use-cases/load-page-config-from-message.use-case';
import { PageRendererPresenter } from '../../interface-adapters/presenters/page-renderer.presenter';
import { PageConfigLoadedHandler } from '../../interface-adapters/handlers/page-config-loaded.handler';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';
import { PageRendererAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { PAGE_RENDERER_TYPES } from './types';

export function bindPageRenderer(container: Container): void {
    container.bind<PageConfigRepositoryPort>(PAGE_RENDERER_TYPES.PageConfigRepository)
    .to(SupabasePageConfigRepository)
    .inSingletonScope();
  
    container.bind<LoadPageConfigUseCase>(PAGE_RENDERER_TYPES.LoadPageConfigUseCase)
    .to(LoadPageConfigUseCase)
    .inSingletonScope();
  
    container.bind<LoadPageConfigFromMessageUseCase>(PAGE_RENDERER_TYPES.LoadPageConfigFromMessageUseCase)
    .to(LoadPageConfigFromMessageUseCase)
    .inSingletonScope();
  
    container.bind<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter)
    .to(PageRendererPresenter)
    .inSingletonScope();
  
    container
    .bind<IAsyncEventHandler<PageConfigLoadedEvent>>(
      PAGE_RENDERER_TYPES.PageConfigLoadedEventHandler
    )
    .to(PageConfigLoadedHandler)
    .inTransientScope();

    container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
      PAGE_RENDERER_TYPES.AppConfigLoadedEventHandler
    )
    .to(PageRendererAppConfigLoadedHandler)
    .inTransientScope();
}

