import type { Result } from '../../../../shared/result/result';
import type { Translation } from '../../domain/entities/translation';

export interface TranslationRepositoryPort {
  
  getTranslation(key: string, languageCode: string): Promise<Result<Translation | null, Error>>;
  createTranslation(translation: Translation): Promise<Result<Translation, Error>>;
  updateTranslation(key: string, languageCode: string, value: string): Promise<Result<Translation, Error>>;

  findAll(): Promise<Result<Translation[], Error>>;
  getTranslationsByLanguage(languageCode: string): Promise<Result<Translation[], Error>>;
  upsertTranslation(key: string, languageCode: string, value: string): Promise<Result<{ translation: Translation; wasCreated: boolean }, Error>>;
  bulkUpdateTranslations(updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>): Promise<Result<void, Error>>;

  getTranslationCoverage(languageCode: string): Promise<Result<{
    totalKeys: number;
    translatedKeys: number;
    coveragePercentage: number;
  }, Error>>;
}
