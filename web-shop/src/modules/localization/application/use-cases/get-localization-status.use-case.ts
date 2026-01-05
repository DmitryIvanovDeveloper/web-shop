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

      // Calculate translation coverage
      const coverageResult = await this._calculateTranslationCoverage();
      if (coverageResult.isFailure) {
        return Failure.fail(coverageResult.error || new Error('Unknown error'));
      }

      const activeLanguage = activeLanguageResult.value!;
      const supportedLanguages = supportedLanguagesResult.value!;
      const coverage = coverageResult.value!;

      return Success.ok({
        activeLanguage: this._mapLanguageToResponse(activeLanguage),
        supportedLanguages: supportedLanguages.map(lang => this._mapLanguageToResponse(lang)),
        translationCoverage: coverage.coverage,
        incompleteLanguages: coverage.incompleteLanguages
      });
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private async _calculateTranslationCoverage(): Promise<Result<{
    coverage: LocalizationStatusResponse['translationCoverage'];
    incompleteLanguages: LocalizationStatusResponse['incompleteLanguages'];
  }, Error>> {
    try {
      // Get all supported languages
      const supportedLanguagesResult = await this._languageRepository.getAllLanguages();
      if (supportedLanguagesResult.isFailure) {
        return Failure.fail(supportedLanguagesResult.error || new Error('Failed to get supported languages'));
      }

      const supportedLanguages = supportedLanguagesResult.value!;

      // Get all unique translation keys (we'll use a fixed set for now)
      const allKeys = [
        'products.buyButton',
        'products.purchasedBadge',
        'products.emptyState',
        'products.loadingState',
        'auth.loginButton',
        'auth.logoutButton',
        'auth.welcomeTitle',
        'auth.successMessage'
      ];

      const totalKeys = allKeys.length;
      const totalLanguages = supportedLanguages.length;
      let fullyTranslatedKeys = 0; // Keys translated in ALL languages
      const incompleteLanguages: LocalizationStatusResponse['incompleteLanguages'] = [];

      // For each key, check if it's translated in all languages
      for (const key of allKeys) {
        let translatedInAllLanguages = true;
        const missingInLanguages: string[] = [];

        for (const language of supportedLanguages) {
          const translationsResult = await this._translationRepository.getTranslationsByLanguage(language.code.value);
          if (translationsResult.isFailure) {
            return Failure.fail(translationsResult.error || new Error(`Failed to get translations for ${language.code.value}`));
          }

          const translations = translationsResult.value!;
          const hasTranslation = translations.some(t => t.key.value === key && t.value && t.value.trim().length > 0);

          if (!hasTranslation) {
            translatedInAllLanguages = false;
            missingInLanguages.push(language.code.value);
          }
        }

        if (translatedInAllLanguages) {
          fullyTranslatedKeys++;
        } else {
          // Add to incomplete languages
          for (const langCode of missingInLanguages) {
            const language = supportedLanguages.find(l => l.code.value === langCode);
            if (language) {
              const existing = incompleteLanguages.find(il => il.languageCode === langCode);
              if (existing) {
                existing.missingTranslations++;
              } else {
                incompleteLanguages.push({
                  languageCode: langCode,
                  languageName: language.name,
                  missingTranslations: 1
                });
              }
            }
          }
        }
      }

      const coveragePercentage = totalKeys > 0 ? Math.round((fullyTranslatedKeys / totalKeys) * 100) : 0;

      return Success.ok({
        coverage: {
          totalKeys,
          translatedKeys: fullyTranslatedKeys,
          coveragePercentage
        },
        incompleteLanguages
      });
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _mapLanguageToResponse(language: any): LocalizationStatusResponse['activeLanguage'] {
    return {
      code: language.code.value,
      name: language.name,
      nativeName: language.nativeName,
      direction: language.direction.value,
      isActive: language.isActive,
      fallbackCode: language.fallbackCode?.value
    };
  }
}
