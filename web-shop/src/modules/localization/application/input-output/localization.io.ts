// Language DTOs
export interface ChangeActiveLanguageRequest {
  languageCode: string;
}

export interface CreateLanguageRequest {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  fallbackCode?: string;
}

export interface UpdateLanguageRequest {
  code: string;
  name?: string;
  nativeName?: string;
  fallbackCode?: string;
}

export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  fallbackCode?: string;
}

// Translation DTOs
export interface CreateTranslationRequest {
  key: string;
  languageCode: string;
  value: string;
}

export interface UpdateTranslationRequest {
  key: string;
  languageCode: string;
  value: string;
}

export interface TranslationResponse {
  key: string;
  languageCode: string;
  value: string;
  isTranslated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Bulk operations
export interface BulkUpdateTranslationsRequest {
  translations: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>;
}

export interface LocalizationStatusResponse {
  activeLanguage: LanguageResponse;
  supportedLanguages: LanguageResponse[];
  translationCoverage: {
    totalKeys: number;
    translatedKeys: number;
    coveragePercentage: number;
  };
  incompleteLanguages: Array<{
    languageCode: string;
    languageName: string;
    missingTranslations: number;
  }>;
}
