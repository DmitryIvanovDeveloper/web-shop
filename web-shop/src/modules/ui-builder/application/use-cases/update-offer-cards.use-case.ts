import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import type {
  AppConfigStructure,
  OfferCardTemplate,
} from '../../domain/entities/app-config.entity';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { SaveDraftUseCase } from './save-draft.use-case';

@injectable()
export class UpdateOfferCardsUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStoragePort)
    private readonly _storage: ConfigStoragePort,
    @inject(UI_BUILDER_TYPES.SaveDraftUseCase)
    private readonly _saveDraftUseCase: SaveDraftUseCase
  ) {}

  async execute(
    appId: string,
    offerCards: OfferCardTemplate[],
  ): Promise<Result<void, Error>> {
    try {
      const draftResult = await this._storage.loadDraft(appId);
      let currentConfig = draftResult.isSuccess ? draftResult.value : null;

      if (!currentConfig) {
        const activeResult = await this._storage.loadActive(appId);

        if (!activeResult.isSuccess) {
          return Result.fail(activeResult.error || new Error('Failed to load active config as fallback'));
        }

        if (!activeResult.value) {
          const error = new Error(`No draft or active config found for appId: ${appId}`);
          return Result.fail(error);
        }

        currentConfig = activeResult.value;
      }

      const config = currentConfig.config as AppConfigStructure;

      const updatedConfig: AppConfigStructure = {
        ...config,
        offerCards: [...offerCards],
      };

      const saveResult = await this._saveDraftUseCase.execute({
        appId,
        config: updatedConfig as Record<string, unknown>,
      });

      if (!saveResult.isSuccess) {
        return Result.fail(saveResult.error || new Error('Failed to save updated config'));
      }

      return Result.ok<void, Error>(undefined as void);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

