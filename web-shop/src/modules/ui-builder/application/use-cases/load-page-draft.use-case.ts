import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

/**
 * Use case for loading draft page configuration
 * If no draft exists, returns null
 */
@injectable()
export class LoadPageDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string, pageSlug: string = 'home'): Promise<Result<PageConfig | null, Error>> {
    this._logger.info('[LoadPageDraftUseCase] Loading draft page config', { appId, pageSlug });

    try {
      const result = await this._storage.loadDraft(appId, pageSlug);

      if (!result.isSuccess) {
        this._logger.error('[LoadPageDraftUseCase] Failed to load draft', result.error);
        return Result.error(result.error || new Error('Failed to load page draft'));
      }

      if (!result.value) {
        this._logger.info('[LoadPageDraftUseCase] No draft found, will create new', { appId, pageSlug });
        return Result.ok<PageConfig | null, Error>(null);
      }

      this._logger.info('[LoadPageDraftUseCase] Draft loaded successfully', { 
        appId, 
        pageSlug, 
        sectionsCount: result.value.sections.length 
      });
      return Result.ok<PageConfig | null, Error>(result.value);
    } catch (error) {
      this._logger.error('[LoadPageDraftUseCase] Error loading draft', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

