import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../ports/language-repository.port';
import type { TranslationRepositoryPort } from '../ports/translation-repository.port';
import type { LocalizationStatusResponse } from '../input-output/localization.io';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';

export type GetLocalizationStatusRequest = void;

@injectable()
export class GetLocalizationStatusUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.LanguageRepository)
    private readonly _languageRepository: LanguageRepositoryPort,
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort
  ) {}

  async execute(
    _request: GetLocalizationStatusRequest
  ): Promise<Result<LocalizationStatusResponse, Error>> {
    try {
      // Get active language
      const activeLanguageResult = await this._languageRepository.getActiveLanguage();
      if (activeLanguageResult.isFailure) {
        return Failure.fail(activeLanguageResult.error || new Error('Unknown error'));
      }

      // Get all supported languages
      const supportedLanguagesResult = await this._languageRepository.getAllLanguages();
      if (supportedLanguagesResult.isFailure) {
        return Failure.fail(supportedLanguagesResult.error || new Error('Unknown error'));
      }

      const activeLanguage = activeLanguageResult.data;
      const supportedLanguages = supportedLanguagesResult.data;

      // Calculate translation coverage for each language
      const translationCoverage: LocalizationStatusResponse['translationCoverage'] = {};
      const incompleteLanguages: LocalizationStatusResponse['incompleteLanguages'] = [];

      for (const language of supportedLanguages) {
        const translationsResult = await this._translationRepository.getTranslationsByLanguage(language.code.value);
        if (translationsResult.isFailure) {
          return Failure.fail(translationsResult.error || new Error('Unknown error'));
        }

        const translations = translationsResult.data;
        const totalKeys = translations.length;
        const translatedKeys = translations.filter(t => t.isTranslated).length;
        const coveragePercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

        translationCoverage[language.code.value] = {
          totalKeys,
          translatedKeys,
          coveragePercentage
        };

        if (coveragePercentage < 100) {
          incompleteLanguages.push({
            languageCode: language.code.value,
            languageName: language.name,
            coveragePercentage
          });
        }
      }

      const response: LocalizationStatusResponse = {
        activeLanguage: activeLanguage ? {
          code: activeLanguage.code.value,
          name: activeLanguage.name,
          nativeName: activeLanguage.nativeName,
          direction: activeLanguage.direction.value
        } : null,
        supportedLanguages: supportedLanguages.map(lang => ({
          code: lang.code.value,
          name: lang.name,
          nativeName: lang.nativeName,
          direction: lang.direction.value,
          isActive: lang.isActive,
          fallbackCode: lang.fallbackCode?.value
        })),
        translationCoverage,
        incompleteLanguages
      };

      return Success.ok(response);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
