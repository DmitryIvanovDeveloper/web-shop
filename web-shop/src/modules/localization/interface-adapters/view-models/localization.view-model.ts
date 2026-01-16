import type { LanguageResponse, LocalizationStatusResponse } from '../../application/input-output/localization.io';

export interface LocalizationViewModel {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly activeLanguage: LanguageResponse | null;
  readonly supportedLanguages: LanguageResponse[];
  readonly translations: Array<{
    key: string;
    languageCode: string;
    value: string;
    isTranslated: boolean;
  }>;
  readonly translationCoverage: {
    readonly totalKeys: number;
    readonly translatedKeys: number;
    readonly coveragePercentage: number;
  };
  readonly incompleteLanguages: LocalizationStatusResponse['incompleteLanguages'];
}


