import type { LocalizationPresenter } from '../../interface-adapters/presenters/localization.presenter';

/**
 * Translation service for getting localized text
 * Should be used at the presenter/view-model level to provide localized text to components
 */
export class TranslationService {
  constructor(private readonly presenter: LocalizationPresenter) {}

  /**
   * Get localized text for a key with optional fallback
   */
  t(key: string, fallback?: string): string {
    const translation = this.presenter.viewModel.translations[key];
    return translation || fallback || key;
  }

  /**
   * Get current text direction
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.presenter.viewModel.direction;
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): string | undefined {
    return this.presenter.viewModel.currentLanguage?.code;
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string): boolean {
    return key in this.presenter.viewModel.translations;
  }
}

/**
 * Factory function to create translation service
 */
export function createTranslationService(presenter: LocalizationPresenter): TranslationService {
  return new TranslationService(presenter);
}
