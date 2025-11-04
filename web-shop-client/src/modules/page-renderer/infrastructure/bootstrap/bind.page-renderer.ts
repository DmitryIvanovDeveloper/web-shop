import type { Container } from 'inversify';
import type { PageConfigRepositoryPort } from '../../application/ports/page-config-repository.port';
import type { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { SupabasePageConfigRepository } from '../repositories/supabase-page-config.repository';
import { LoadPageConfigUseCase } from '../../application/use-cases/load-page-config.use-case';
import { PageRendererPresenter } from '../../interface-adapters/presenters/page-renderer.presenter';
import { PageConfigLoadedHandler } from '../../interface-adapters/handlers/page-config-loaded.handler';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';
import { PAGE_RENDERER_TYPES } from './types';

export function bindPageRenderer(container: Container): void {
  // Repository
  container.bind<PageConfigRepositoryPort>(PAGE_RENDERER_TYPES.PageConfigRepository)
    .to(SupabasePageConfigRepository)
    .inSingletonScope();
  
  // Use Case
  container.bind<LoadPageConfigUseCase>(PAGE_RENDERER_TYPES.LoadPageConfigUseCase)
    .to(LoadPageConfigUseCase)
    .inSingletonScope();
  
  // Presenter
  container.bind<PageRendererPresenter>(PAGE_RENDERER_TYPES.PageRendererPresenter)
    .to(PageRendererPresenter)
    .inSingletonScope();
  
  // Event Handler
  container
    .bind<IAsyncEventHandler<PageConfigLoadedEvent>>(
      Symbol.for('IAsyncEventHandler<PageConfigLoadedEvent>')
    )
    .to(PageConfigLoadedHandler)
    .inTransientScope();
}

