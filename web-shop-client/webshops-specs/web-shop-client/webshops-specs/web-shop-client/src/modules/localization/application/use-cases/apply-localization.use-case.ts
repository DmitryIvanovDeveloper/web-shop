import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import type { LanguageRepositoryPort } from '../ports/language-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

export type ApplyLocalizationRequest = {
  languageCode: string;
  translationKeys: string[];
};

export type ApplyLocalizationResponse = {
  languageCode: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
};

@injectable()
export class ApplyLocalizationUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort,
    @inject(LOCALIZATION_TYPES.LanguageRepository)
    private readonly _languageRepository: LanguageRepositoryPort,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(request: ApplyLocalizationRequest): Promise<Result<ApplyLocalizationResponse, Error>> {
    try {
      this._logger.info('[ApplyLocalizationUseCase] Applying localization', {
        languageCode: request.languageCode,
        keysCount: request.translationKeys.length
      });

      const languageResult = await this._languageRepository.getLanguageByCode(request.languageCode);
      if (languageResult.isFailure || !languageResult.data) {
        this._logger.error('[ApplyLocalizationUseCase] Language not found or failed to retrieve', {
          languageCode: request.languageCode,
          error: languageResult.error
        });
        return Failure.fail(languageResult.error || new Error('Language not found'));
      }

      const language = languageResult.data;

      const translationsResult = await this._translationRepository.getTranslationsByLanguage(request.languageCode);
      if (translationsResult.isFailure) {
        this._logger.error('[ApplyLocalizationUseCase] Failed to get translations', {
          languageCode: request.languageCode,
          error: translationsResult.error
        });
        return Failure.fail(translationsResult.error);
      }

      const translationsMap: Record<string, string> = {};
      for (const key of request.translationKeys) {
        const foundTranslation = translationsResult.data.find(t => t.key.value === key);
        translationsMap[key] = foundTranslation ? foundTranslation.value : key; // Fallback to key itself
      }

      this._logger.info('[ApplyLocalizationUseCase] Localization applied successfully', {
        languageCode: request.languageCode,
        translatedKeysCount: Object.keys(translationsMap).length
      });

      return Success.ok({
        languageCode: language.code.value,
        direction: language.direction.value,
        translations: translationsMap
      });
    } catch (error) {
      this._logger.error('[ApplyLocalizationUseCase] Unexpected error applying localization', {
        languageCode: request.languageCode,
        error
      });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
