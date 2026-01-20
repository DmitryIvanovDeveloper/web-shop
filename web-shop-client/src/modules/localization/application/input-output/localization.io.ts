

export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  fallbackCode?: string;
  flag?: string;
}


