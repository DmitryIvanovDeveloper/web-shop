import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type {
  AppConfigStructure,
  OfferCardTemplate,
} from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { SaveDraftUseCase } from './save-draft.use-case';

@injectable()
export class UpdateOfferCardsUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStoragePort)
    private readonly _storage: ConfigStoragePort,
    @inject(UI_BUILDER_TYPES.SaveDraftUseCase)
    private readonly _saveDraftUseCase: SaveDraftUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
  ) {}

  async execute(
    appId: string,
    offerCards: OfferCardTemplate[],
  ): Promise<Result<void, Error>> {
    this._logger.info('[UpdateOfferCardsUseCase] Updating offer cards', {
      appId,
      count: offerCards.length,
    });

    try {
      // Load current draft config (fallback to active if draft is missing)
      const draftResult = await this._storage.loadDraft(appId);
      let currentConfig = draftResult.isSuccess ? draftResult.value : null;

      if (!currentConfig) {
        if (!draftResult.isSuccess) {
          this._logger.warn('[UpdateOfferCardsUseCase] Failed to load draft config, falling back to active', {
            appId,
            error: draftResult.error?.message,
          });
        } else {
          this._logger.info('[UpdateOfferCardsUseCase] No draft config found, loading active config', { appId });
        }

        const activeResult = await this._storage.loadActive(appId);

        if (!activeResult.isSuccess) {
          this._logger.error('[UpdateOfferCardsUseCase] Failed to load active config as fallback', activeResult.error);
          return Result.fail(activeResult.error || new Error('Failed to load active config as fallback'));
        }

        if (!activeResult.value) {
          const error = new Error(`No draft or active config found for appId: ${appId}`);
          this._logger.error('[UpdateOfferCardsUseCase] No config available to update', { appId });
          return Result.fail(error);
        }

        currentConfig = activeResult.value;
      }

      const config = currentConfig.config as AppConfigStructure;

      const updatedConfig: AppConfigStructure = {
        ...config,
        offerCards: [...offerCards],
      };

      // Save updated config using SaveDraftUseCase
      const saveResult = await this._saveDraftUseCase.execute({
        appId,
        config: updatedConfig as Record<string, unknown>,
      });

      if (!saveResult.isSuccess) {
        this._logger.error('[UpdateOfferCardsUseCase] Failed to save updated config', saveResult.error);
        return Result.fail(saveResult.error || new Error('Failed to save updated config'));
      }

      this._logger.info('[UpdateOfferCardsUseCase] Offer cards updated successfully', {
        appId,
        count: offerCards.length,
      });
      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      this._logger.error('[UpdateOfferCardsUseCase] Error updating offer cards', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

