import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { TranslationRepositoryPort, Translation } from '../ports/translation-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';

export type ApplyLocalizationRequest = {
  languageCode: string;
  translationKeys: string[];
};

export type ApplyLocalizationResponse = {
  translations: Record<string, string>;
  languageCode: string;
  direction: 'ltr' | 'rtl';
};

@injectable()
export class ApplyLocalizationUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort
  ) {}

  async execute(
    request: ApplyLocalizationRequest
  ): Promise<Result<ApplyLocalizationResponse, Error>> {
    try {
      // Get translations for the requested language
      const translationsResult = await this._translationRepository.getTranslationsByLanguage(
        request.languageCode
      );

      if (translationsResult.failure) {
        return Failure.fail((translationsResult as any).error);
      }

      const translations = (translationsResult as any).data;

      // Filter translations by requested keys and create a map
      const translationMap: Record<string, string> = {};

      // Add all available translations for the language
      translations.forEach((translation: Translation) => {
        translationMap[translation.key] = translation.value;
      });

      // Determine text direction based on language code
      const direction = this._getTextDirection(request.languageCode);

      return Success.ok({
        translations: translationMap,
        languageCode: request.languageCode,
        direction
      });
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private _getTextDirection(languageCode: string): 'ltr' | 'rtl' {
    // Right-to-left languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi'];
    return rtlLanguages.includes(languageCode.toLowerCase()) ? 'rtl' : 'ltr';
  }
}