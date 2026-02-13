import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result/result';
import type { PageConfigRepositoryPort } from '../ports/page-config-repository.port';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { PAGE_RENDERER_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PageConfigLoadedEvent } from '../../domain/events/page-config-loaded.event';

interface LoadPageConfigInput {
  appId: string;
  pageSlug: string;
  previewMode: boolean;
}

@injectable()
export class LoadPageConfigUseCase {
  constructor(
    @inject(PAGE_RENDERER_TYPES.PageConfigRepository) 
    private readonly _repository: PageConfigRepositoryPort,
    @inject(ROOT_TYPES.EventBus) 
    private readonly _eventBus: EventBus,
    @inject(ROOT_TYPES.Logger) 
    private readonly _logger: Logger
  ) {}

  async execute(input: LoadPageConfigInput): Promise<Result<void, Error>> {
    this._logger.info('[LoadPageConfigUseCase] Loading page config', input);
    
    const isDraft = input.previewMode;
    const result = await this._repository.loadByAppIdAndSlug(
      input.appId, 
      input.pageSlug, 
      isDraft
    );
    
    if (result.isFailure()) {
      this._logger.error('[LoadPageConfigUseCase] Failed to load', result.error);
      return Result.error(result.error);
    }
    
        await this._eventBus.publishAsync(
      new PageConfigLoadedEvent(
        result.data || null,
        input.appId,
        input.pageSlug
      )
    );
    
    this._logger.info('[LoadPageConfigUseCase] Event published', {
      hasConfig: !!result.data,
      sectionsCount: result.data?.sections.length || 0
    });
    
    return Result.ok(undefined);
  }
}

