import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { DraftConfigError } from '../../domain/errors/config.error';

export interface PublishDraftInput {
  appId: string;
  merchantId: string;
  draftVersion: number;
}

export interface PublishDraftOutput {
  version: number;
  publishedAt: Date;
}

@injectable()
export class PublishDraftUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.ConfigStorage)
    private readonly _storage: ConfigStoragePort
  ) {}

  public async execute(input: PublishDraftInput): Promise<Result<PublishDraftOutput, Error>> {
    const { appId, merchantId, draftVersion } = input;

    const publishResult = await this._storage.publishDraft(appId, draftVersion);

    if (publishResult.isFailure) {
      const err = publishResult.error ?? new Error('Failed to publish draft');
      return Result.error(err);
    }

    const publishedConfig = publishResult.value;

    if (!publishedConfig) {
      const error = new DraftConfigError(`Draft version ${draftVersion} not found for app_id: ${appId}`);
      return Result.error(error);
    }

    return Result.ok({
      version: publishedConfig.version.value,
      publishedAt: publishedConfig.updatedAt as Date,
    });
  }
}























