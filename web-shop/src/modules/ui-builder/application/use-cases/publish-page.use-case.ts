import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

/**
 * Use case for publishing page configuration
 * Makes the current draft the active version
 */
@injectable()
export class PublishPageUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string, pageSlug: string = 'home'): Promise<Result<void, Error>> {
    this._logger.info('[PublishPageUseCase] Publishing page config', { appId, pageSlug });

    try {
      const result = await this._storage.publish(appId, pageSlug);

      if (!result.isSuccess) {
        this._logger.error('[PublishPageUseCase] Failed to publish', result.error);
        return Result.error(result.error || new Error('Failed to publish page'));
      }

      this._logger.info('[PublishPageUseCase] Page published successfully', { appId, pageSlug });
      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[PublishPageUseCase] Error publishing', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

