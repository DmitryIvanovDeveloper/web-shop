import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
@injectable()
export class ListPagesUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort
  ) {}

  async execute(appId: string): Promise<Result<string[], Error>> {
    try {
      const result = await this._storage.listPages(appId);

      if (!result.isSuccess) {
        return Result.error(result.error || new Error('Failed to list pages'));
      }

      return Result.ok<string[], Error>(result.value || []);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
