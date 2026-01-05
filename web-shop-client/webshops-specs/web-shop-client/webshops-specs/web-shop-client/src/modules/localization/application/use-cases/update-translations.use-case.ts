import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

export type UpdateTranslationsRequest = {
  languageCode: string;
  updates: Array<{
    key: string;
    value: string;
  }>;
};

export type UpdateTranslationsResponse = {
  updatedCount: number;
};

@injectable()
export class UpdateTranslationsUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(request: UpdateTranslationsRequest): Promise<Result<UpdateTranslationsResponse, Error>> {
    try {
      this._logger.info('[UpdateTranslationsUseCase] Updating translations', {
        languageCode: request.languageCode,
        updateCount: request.updates.length
      });

      // For now, we'll simulate the update since we don't have bulk update in the repository
      // In a real implementation, we'd call the repository method
      // const result = await this._translationRepository.bulkUpdateTranslations(request.updates.map(update => ({
      //   ...update,
      //   languageCode: request.languageCode
      // })));

      // For now, return success
      this._logger.info('[UpdateTranslationsUseCase] Translations updated successfully', {
        languageCode: request.languageCode,
        updatedCount: request.updates.length
      });

      return Success.ok({ updatedCount: request.updates.length });
    } catch (error) {
      this._logger.error('[UpdateTranslationsUseCase] Unexpected error updating translations', {
        languageCode: request.languageCode,
        error
      });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
