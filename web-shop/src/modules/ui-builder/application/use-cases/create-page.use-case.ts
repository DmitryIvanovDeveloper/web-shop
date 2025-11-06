import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

/**
 * Use case for creating a new page with a given pageSlug
 * Creates a new draft page configuration with empty sections
 */
@injectable()
export class CreatePageUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string, pageSlug: string): Promise<Result<PageConfig, Error>> {
    this._logger.info('[CreatePageUseCase] Creating new page', { appId, pageSlug });

    try {
      // Check if page already exists
      const existingResult = await this._storage.loadDraft(appId, pageSlug);
      
      if (existingResult.isSuccess && existingResult.value !== null) {
        this._logger.warn('[CreatePageUseCase] Page already exists', { appId, pageSlug });
        return Result.error(new Error(`Page with slug "${pageSlug}" already exists`));
      }

      // Create new page config with empty sections
      const newPageConfig: PageConfig = {
        id: `page-${Date.now()}`,
        appId,
        pageSlug,
        version: 1,
        isDraft: true,
        isActive: false,
        sections: [],
        pageStyles: {},
      };

      // Save the new page as draft
      const saveResult = await this._storage.saveDraft(newPageConfig);

      if (!saveResult.isSuccess) {
        this._logger.error('[CreatePageUseCase] Failed to save new page', saveResult.error);
        return Result.error(saveResult.error || new Error('Failed to create page'));
      }

      this._logger.info('[CreatePageUseCase] Page created successfully', { appId, pageSlug });
      return Result.ok<PageConfig, Error>(newPageConfig);
    } catch (error) {
      this._logger.error('[CreatePageUseCase] Error creating page', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}




