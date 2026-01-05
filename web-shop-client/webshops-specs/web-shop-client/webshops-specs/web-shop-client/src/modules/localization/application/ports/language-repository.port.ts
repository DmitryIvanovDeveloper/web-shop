import type { Result } from '../../../../shared/result/result';
import type { LanguageResponse } from '../input-output/localization.io';

export interface LanguageRepositoryPort {
  getActiveLanguage(): Promise<Result<LanguageResponse | null, Error>>;
  getAllLanguages(): Promise<Result<LanguageResponse[], Error>>;
  getLanguageByCode(code: string): Promise<Result<LanguageResponse | null, Error>>;
  setActiveLanguage(code: string): Promise<Result<void, Error>>;
}
