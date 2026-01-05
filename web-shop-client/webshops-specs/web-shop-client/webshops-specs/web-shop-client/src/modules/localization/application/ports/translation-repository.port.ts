import type { Result } from '../../../../shared/result/result';

export interface Translation {
  key: string;
  value: string;
  languageCode: string;
  isTranslated: boolean;
}

export interface TranslationRepositoryPort {
  getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>>;
}
