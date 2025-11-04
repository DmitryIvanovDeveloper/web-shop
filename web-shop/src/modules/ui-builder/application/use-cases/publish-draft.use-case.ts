import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { ConfigStoragePort } from '../ports/config-storage.port';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
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
    private readonly _storage: ConfigStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(input: PublishDraftInput): Promise<Result<PublishDraftOutput, Error>> {
    const { appId, merchantId, draftVersion } = input;

    this._logger.info(`[PublishDraftUseCase] Publishing draft for app_id: ${appId}, version: ${draftVersion}`);

    // Publish draft via storage (handles deactivation and activation)
    const publishResult = await this._storage.publishDraft(appId, draftVersion);

    if (publishResult.isFailure) {
      const err = publishResult.error ?? new Error('Failed to publish draft');
      this._logger.error('[PublishDraftUseCase] Failed to publish draft', err);
      return Result.error(err);
    }

    const publishedConfig = publishResult.value;

    if (!publishedConfig) {
      const error = new DraftConfigError(`Draft version ${draftVersion} not found for app_id: ${appId}`);
      this._logger.error('[PublishDraftUseCase] Draft not found', error);
      return Result.error(error);
    }

    this._logger.info('[PublishDraftUseCase] Draft published successfully', {
      appId,
      version: publishedConfig.version.value
    });

    return Result.ok({
      version: publishedConfig.version.value,
      publishedAt: publishedConfig.updatedAt as Date,
    });
  }
}









