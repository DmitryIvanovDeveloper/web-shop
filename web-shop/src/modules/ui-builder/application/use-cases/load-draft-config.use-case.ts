import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';

@injectable()
export class LoadDraftConfigUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStoragePort)
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(appId: string): Promise<Result<AppConfig, Error>> {
    this._logger.info('[LoadDraftConfigUseCase] Loading draft config', { appId });

    try {
      // Try to load draft config first
      const draftResult = await this._storage.loadDraft(appId);
      
      // If draft exists, return it
      if (draftResult.isSuccess && draftResult.value) {
        this._logger.info('[LoadDraftConfigUseCase] Draft config loaded successfully', { appId });
        return Result.ok(draftResult.value);
      }

      // No draft found (either error or null), fallback to active config
      if (!draftResult.isSuccess) {
        this._logger.warn('[LoadDraftConfigUseCase] Failed to load draft config, falling back to active', { 
          appId, 
          error: draftResult.error?.message 
        });
      } else {
        this._logger.info('[LoadDraftConfigUseCase] No draft found, loading active config', { appId });
      }
      
      const activeResult = await this._storage.loadActive(appId);
      
      if (!activeResult.isSuccess) {
        this._logger.error('[LoadDraftConfigUseCase] Failed to load active config', activeResult.error);
        return Result.error(activeResult.error || new Error("Failed to load active config"));
      }

      if (!activeResult.value) {
        const error = new Error(`No draft or active config found for appId: ${appId}`);
        this._logger.error('[LoadDraftConfigUseCase] No config found', { appId });
        return Result.error(error);
      }

      this._logger.info('[LoadDraftConfigUseCase] Active config loaded successfully', { appId });
      return Result.ok(activeResult.value);
    } catch (error) {
      this._logger.error('[LoadDraftConfigUseCase] Error loading config', error);
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}


