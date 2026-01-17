import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
@injectable()
export class PublishPageUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort
  ) {}

  async execute(appId: string, pageSlug: string = 'home'): Promise<Result<void, Error>> {
    try {
      const result = await this._storage.publish(appId, pageSlug);

      if (!result.isSuccess) {
        return Result.error(result.error || new Error('Failed to publish page'));
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

