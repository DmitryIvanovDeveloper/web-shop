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
      // Get all translations to find unique keys
      const allTranslationsResult = await this._translationRepository.findAll();
      if (allTranslationsResult.isFailure) {
        return Failure.fail(allTranslationsResult.error || new Error('Failed to get all translations'));
      }

      const allTranslations = allTranslationsResult.value!;
      
      // Get all unique translation keys from database
      const allKeysSet = new Set<string>();
      allTranslations.forEach(t => {
        if (t.key && t.key.value) {
          allKeysSet.add(t.key.value);
        }
      });
      const allKeys = Array.from(allKeysSet).sort();

      if (allKeys.length === 0) {
        return Success.ok({
          coverage: {
            totalKeys: 0,
            translatedKeys: 0,
            coveragePercentage: 0
          },
          incompleteLanguages: []
        });
      }

      // Get all supported languages that actually have translations
      const languagesWithTranslations = new Set<string>();
      allTranslations.forEach(t => {
        if (t.languageCode && t.languageCode.value) {
          languagesWithTranslations.add(t.languageCode.value);
        }
      });

      // Get all supported languages from repository
      const supportedLanguagesResult = await this._languageRepository.getAllLanguages();
      if (supportedLanguagesResult.isFailure) {
        return Failure.fail(supportedLanguagesResult.error || new Error('Failed to get supported languages'));
      }

      const supportedLanguages = supportedLanguagesResult.value!;
      
      // Filter to only languages that have translations in the database
      const languagesToCheck = supportedLanguages.filter(lang => 
        languagesWithTranslations.has(lang.code.value)
      );

      const totalKeys = allKeys.length;
      const totalLanguages = languagesToCheck.length;
      let fullyTranslatedKeys = 0; // Keys translated in ALL languages with translations
      const incompleteLanguages: LocalizationStatusResponse['incompleteLanguages'] = [];

      // Group translations by key for efficient lookup
      const translationsByKey = new Map<string, Map<string, boolean>>();
      allTranslations.forEach(t => {
        const key = t.key.value;
        const langCode = t.languageCode.value;
        if (!translationsByKey.has(key)) {
          translationsByKey.set(key, new Map());
        }
        const hasTranslation = Boolean(t.value && t.value.trim().length > 0);
        translationsByKey.get(key)!.set(langCode, hasTranslation);
      });

      // For each key, check if it's translated in all languages that have translations
      for (const key of allKeys) {
        const keyTranslations = translationsByKey.get(key) || new Map();
        let translatedInAllLanguages = true;
        const missingInLanguages: string[] = [];

        for (const language of languagesToCheck) {
          const langCode = language.code.value;
          const hasTranslation = keyTranslations.get(langCode) === true;

          if (!hasTranslation) {
            translatedInAllLanguages = false;
            missingInLanguages.push(langCode);
          }
        }

        if (translatedInAllLanguages) {
          fullyTranslatedKeys++;
        } else {
          // Add to incomplete languages
          for (const langCode of missingInLanguages) {
            const language = languagesToCheck.find(l => l.code.value === langCode);
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
