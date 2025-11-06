import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

/**
 * Use case for listing all pages for an application
 * Returns unique page slugs
 */
@injectable()
export class ListPagesUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string): Promise<Result<string[], Error>> {
    this._logger.info('[ListPagesUseCase] Listing pages', { appId });

    try {
      const result = await this._storage.listPages(appId);

      if (!result.isSuccess) {
        this._logger.error('[ListPagesUseCase] Failed to list pages', result.error);
        return Result.error(result.error || new Error('Failed to list pages'));
      }

      this._logger.info('[ListPagesUseCase] Pages listed successfully', { 
        appId, 
        count: result.value?.length || 0
      });
      return Result.ok<string[], Error>(result.value || []);
    } catch (error) {
      this._logger.error('[ListPagesUseCase] Error listing pages', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
