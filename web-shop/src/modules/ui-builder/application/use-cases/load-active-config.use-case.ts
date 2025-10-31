import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

@injectable()
export class LoadActiveConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStoragePort)
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string): Promise<Result<AppConfig, Error>> {
    this._logger.info('[LoadActiveConfigUseCase] Loading active config', { appId });

    try {
      const activeResult = await this._storage.loadActive(appId);
      
      if (!activeResult.isSuccess) {
        this._logger.error('[LoadActiveConfigUseCase] Failed to load active config', activeResult.error);
        return Result.fail(activeResult.error);
      }

      if (!activeResult.value) {
        const error = new Error(`No active config found for appId: ${appId}`);
        this._logger.error('[LoadActiveConfigUseCase] No active config found', { appId });
        return Result.fail(error);
      }

      this._logger.info('[LoadActiveConfigUseCase] Active config loaded successfully', { appId });
      return Result.ok(activeResult.value);
    } catch (error) {
      this._logger.error('[LoadActiveConfigUseCase] Error loading config', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}


