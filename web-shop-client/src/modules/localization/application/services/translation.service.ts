import type { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';


export class TranslationService {
  constructor(private readonly presenter: LocalizationPresenter) {}

  
  t(key: string, fallback?: string): string {
    const translation = this.presenter.viewModel.translations[key];
    return translation || fallback || key;
  }

  
  getDirection(): 'ltr' | 'rtl' {
    return this.presenter.viewModel.direction;
  }

  
  getCurrentLanguage(): string | undefined {
    return this.presenter.viewModel.currentLanguage?.code;
  }

  
  hasTranslation(key: string): boolean {
    return key in this.presenter.viewModel.translations;
  }
}


export function createTranslationService(presenter: LocalizationPresenter): TranslationService {
  return new TranslationService(presenter);
}
