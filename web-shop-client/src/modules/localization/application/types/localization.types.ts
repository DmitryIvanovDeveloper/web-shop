import { Language, Translation } from '../../domain';

/**
 * Input/Output types for use cases
 */

export interface ChangeActiveLanguageInput {
  languageCode: string;
}

export interface ChangeActiveLanguageOutput {
  language: Language;
  previousLanguageCode?: string;
}

export interface UpdateTranslationsInput {
  translations: Array<{
    key: string;
    languageCode: string;
    value: string;
    context?: string;
  }>;
}

export interface UpdateTranslationsOutput {
  updatedCount: number;
  languageCode: string;
}

export interface GetLocalizationStatusInput {
  appId?: string;
}

export interface GetLocalizationStatusOutput {
  activeLanguage: Language;
  supportedLanguages: Language[];
  translationStats: {
    totalKeys: number;
    translatedKeys: number;
    completionPercentage: number;
  };
}

export interface DetectUserLanguageInput {
  fallbackLanguage?: string;
}

export interface DetectUserLanguageOutput {
  detectedLanguage: Language;
  source: 'browser' | 'url' | 'stored' | 'fallback';
}

export interface GetTranslationsInput {
  languageCode: string;
  keys?: string[]; // optional filter by keys
}

export interface GetTranslationsOutput {
  language: Language;
  translations: Translation[];
}
