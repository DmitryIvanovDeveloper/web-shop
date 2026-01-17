import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import type { PageConfigStoragePort } from '../ports/page-config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { generateElementId } from '../../shared/utils/id-generator';

@injectable()
export class CreatePageUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.PageConfigStorage)
    private readonly _storage: PageConfigStoragePort
  ) {}

  async execute(appId: string, pageSlug: string): Promise<Result<PageConfig, Error>> {
    try {
      const existingResult = await this._storage.loadDraft(appId, pageSlug);
      
      if (existingResult.isSuccess && existingResult.value !== null) {
        return Result.error(new Error(`Page with slug "${pageSlug}" already exists`));
      }

      const newPageConfig: PageConfig = {
        id: generateElementId('page'),
        appId,
        merchantId: '550e8400-e29b-41d4-a716-446655440000',
        pageSlug,
        version: 1,
        isDraft: true,
        isActive: false,
        sections: [],
        pageStyles: {},
      };

      const saveResult = await this._storage.saveDraft(newPageConfig);

      if (!saveResult.isSuccess) {
        return Result.error(saveResult.error || new Error('Failed to create page'));
      }

      return Result.ok<PageConfig, Error>(newPageConfig);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}




