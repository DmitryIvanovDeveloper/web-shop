import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import { AppConfigFactory } from '../../domain/entities/app-config.entity';
import { ConfigVersion } from '../../domain/value-objects/config-version.vo';

export interface SaveDraftInput {
  appId: string;
  merchantId: string;
  config: Record<string, unknown>;
  version?: number;
}

@injectable()
export class SaveDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(input: SaveDraftInput): Promise<Result<void, Error>> {
    const { appId, merchantId, config, version } = input;
    this._logger.info('[SaveDraftUseCase] Saving draft config', { appId, merchantId, requestedVersion: version });

    // Create draft config entity
    const draftConfig = AppConfigFactory.create({
      appId,
      merchantId,
      config,
      version: version ? ConfigVersion.of(version) : ConfigVersion.initial(), // Use specified version or initial
      isActive: false,
      isDraft: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save draft
    const saveResult = await this._storage.saveDraft(draftConfig);
    
    if (saveResult.isFailure) {
      this._logger.error('[SaveDraftUseCase] Failed to save draft', saveResult.error);
      return Result.error(saveResult.error || new Error('Failed to save draft'));
    }

    this._logger.info('[SaveDraftUseCase] Draft saved successfully', { appId });
    return Result.ok<void, Error>(undefined as void);
  }
}





