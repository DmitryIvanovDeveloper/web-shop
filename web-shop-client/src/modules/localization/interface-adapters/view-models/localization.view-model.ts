import type { LanguageResponse } from '../../application/input-output/localization.io';

export interface LocalizationViewModel {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly currentLanguage: LanguageResponse | null;
  readonly translations: Record<string, string>;
  readonly direction: 'ltr' | 'rtl';
}


