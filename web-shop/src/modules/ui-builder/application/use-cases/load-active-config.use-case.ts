import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
@injectable()
export class LoadActiveConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStoragePort)
    private readonly _storage: ConfigStoragePort
  ) {}

  async execute(appId: string): Promise<Result<AppConfig, Error>> {
    try {
      const activeResult = await this._storage.loadActive(appId);
      
      if (!activeResult.isSuccess) {
        return Result.error(activeResult.error || new Error('Failed to load active config'));
      }

      if (!activeResult.value) {
        const error = new Error(`No active config found for appId: ${appId}`);
        return Result.error(error);
      }

      return Result.ok(activeResult.value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}


