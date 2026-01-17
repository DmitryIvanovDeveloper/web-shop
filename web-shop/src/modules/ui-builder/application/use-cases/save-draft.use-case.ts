import { inject, injectable } from 'inversify';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { Result } from '@/shared/result/result';
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
    private readonly _storage: ConfigStoragePort
  ) {}

  public async execute(input: SaveDraftInput): Promise<Result<void, Error>> {
    const { appId, merchantId, config, version } = input;

    const draftConfig = AppConfigFactory.create({
      appId,
      merchantId,
      config,
      version: version ? ConfigVersion.of(version) : ConfigVersion.initial(),
      isActive: false,
      isDraft: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saveResult = await this._storage.saveDraft(draftConfig);
    
    if (saveResult.isFailure) {
      return Result.error(saveResult.error || new Error('Failed to save draft'));
    }

    return Result.ok<void, Error>(undefined as void);
  }
}





