export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isActive?: boolean;
  fallbackCode?: string;
}

export interface LocalizationStatusResponse {
  activeLanguage: LanguageResponse | null;
  supportedLanguages: LanguageResponse[];
  translationCoverage: Record<string, {
    totalKeys: number;
    translatedKeys: number;
    coveragePercentage: number;
  }>;
  incompleteLanguages: Array<{
    languageCode: string;
    languageName: string;
    coveragePercentage: number;
  }>;
}

export type GetLocalizationStatusRequest = void;

export interface ApplyLocalizationRequest {
  languageCode: string;
  translationKeys: string[];
}

export interface ApplyLocalizationResponse {
  languageCode: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
}

export interface ChangeActiveLanguageRequest {
  languageCode: string;
}

export interface ChangeActiveLanguageResponse {
  languageCode: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, string>;
}
