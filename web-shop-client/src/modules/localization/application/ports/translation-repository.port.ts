import type { Result } from '../../../../shared/result/result';

export interface Translation {
  key: string;
  value: string;
  languageCode: string;
  isTranslated: boolean;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  context?: string;
}

export interface TranslationRepositoryPort {
  getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>>;
  updateTranslations(languageCode: string, translations: Array<{
    key: string;
    value: string;
    context?: string;
  }>): Promise<Result<void, Error>>;
}
