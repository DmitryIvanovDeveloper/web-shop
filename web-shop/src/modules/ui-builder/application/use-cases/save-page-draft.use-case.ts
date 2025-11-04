import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

/**
 * Use case for saving draft page configuration
 * Updates existing draft or creates new one
 */
@injectable()
export class SavePageDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(config: PageConfig): Promise<Result<void, Error>> {
    this._logger.info('[SavePageDraftUseCase] Saving draft page config', { 
      appId: config.appId, 
      pageSlug: config.pageSlug,
      sectionsCount: config.sections.length 
    });

    try {
      const result = await this._storage.saveDraft(config);

      if (!result.isSuccess) {
        this._logger.error('[SavePageDraftUseCase] Failed to save draft', result.error);
        return Result.error(result.error || new Error('Failed to save page draft'));
      }

      this._logger.info('[SavePageDraftUseCase] Draft saved successfully', { 
        appId: config.appId, 
        pageSlug: config.pageSlug 
      });
      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[SavePageDraftUseCase] Error saving draft', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

