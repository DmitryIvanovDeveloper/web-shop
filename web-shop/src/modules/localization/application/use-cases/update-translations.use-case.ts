import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import type { BulkUpdateTranslationsRequest } from '../input-output/localization.io';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';

export type UpdateTranslationsResponse = {
  updatedCount: number;
  createdCount: number;
};

@injectable()
export class UpdateTranslationsUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort
  ) {}

  async execute(
    request: BulkUpdateTranslationsRequest
  ): Promise<Result<UpdateTranslationsResponse, Error>> {
    try {
      let updatedCount = 0;
      let createdCount = 0;

      for (const translationData of request.translations) {
        const result = await this._translationRepository.upsertTranslation(
          translationData.key,
          translationData.languageCode,
          translationData.value
        );

        if (result.isFailure) {
          return Failure.fail(result.error || new Error('Unknown error'));
        }

        const wasCreated = result.value!.wasCreated;
        if (wasCreated) {
          createdCount++;

        } else {
          updatedCount++;
        }
      }

      return Success.ok({ updatedCount, createdCount });
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
