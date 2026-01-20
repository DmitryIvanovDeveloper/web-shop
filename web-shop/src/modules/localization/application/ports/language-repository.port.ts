import type { Result } from '../../../../shared/result/result';
import type { Language } from '../../domain/entities/language';

export interface LanguageRepositoryPort {
  
  getByCode(code: string): Promise<Result<Language, Error>>;
  getAllLanguages(): Promise<Result<Language[], Error>>;
  createLanguage(language: Language): Promise<Result<Language, Error>>;
  updateLanguage(code: string, updates: Partial<{
    name: string;
    nativeName: string;
    fallbackCode: string;
  }>): Promise<Result<Language, Error>>;

  getActiveLanguage(): Promise<Result<Language, Error>>;
  activateLanguage(code: string): Promise<Result<void, Error>>;
  deactivateLanguage(code: string): Promise<Result<void, Error>>;
}
