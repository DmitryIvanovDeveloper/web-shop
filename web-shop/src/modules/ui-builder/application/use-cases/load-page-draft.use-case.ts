import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
@injectable()
export class LoadPageDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort
  ) {}

  async execute(appId: string, pageSlug: string = 'home'): Promise<Result<PageConfig | null, Error>> {
    try {
      const result = await this._storage.loadDraft(appId, pageSlug);

      if (!result.isSuccess) {
        return Result.error(result.error || new Error('Failed to load page draft'));
      }

      if (!result.value) {
        return Result.ok<PageConfig | null, Error>(null);
      }

      return Result.ok<PageConfig | null, Error>(result.value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

