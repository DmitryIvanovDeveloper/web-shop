import type { Result } from '../../../../shared/result/result';
import type { Language } from '../../domain/entities/language';

export interface LanguageRepositoryPort {
  // CRUD operations
  getByCode(code: string): Promise<Result<Language, Error>>;
  getAllLanguages(): Promise<Result<Language[], Error>>;
  createLanguage(language: Language): Promise<Result<Language, Error>>;
  updateLanguage(code: string, updates: Partial<{
    name: string;
    nativeName: string;
    fallbackCode: string;
  }>): Promise<Result<Language, Error>>;

  // Active language management
  getActiveLanguage(): Promise<Result<Language, Error>>;
  activateLanguage(code: string): Promise<Result<void, Error>>;
  deactivateLanguage(code: string): Promise<Result<void, Error>>;
}
