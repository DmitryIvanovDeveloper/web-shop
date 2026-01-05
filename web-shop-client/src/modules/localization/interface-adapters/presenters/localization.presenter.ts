import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { ApplyLocalizationUseCase, ChangeActiveLanguageUseCase } from '../../application/use-cases';
import type {
  GetLocalizationStatusRequest,
  ApplyLocalizationRequest
} from '../../application/input-output/localization.io';
import type { ChangeActiveLanguageRequest } from '../../application/use-cases/change-active-language.use-case';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { LocalizationViewModel } from '../view-models/localization.view-model';
import { LanguageChangedEvent } from '../../domain/events/language-changed.event';
import { TranslationsConfigEvent } from '../../domain/events/translations-config.event';
import { TextDirection } from '../../domain/value-objects/text-direction';
import { LanguageCode } from '../../domain/value-objects/language-code';
import { isFailure } from '../../../../shared/result/result';

@injectable()
export class LocalizationPresenter {
  private _viewModel: LocalizationViewModel = {
    isLoading: false,
    error: null,
    currentLanguage: null,
    translations: {},
    direction: 'ltr'
  };

  private _subscribers: Array<(vm: LocalizationViewModel) => void> = [];

  private _isChangingLanguage = false;
  private _isInitialized = false;

  constructor(
    @inject(LOCALIZATION_TYPES.ChangeActiveLanguageUseCase)
    private readonly _changeActiveLanguageUseCase: ChangeActiveLanguageUseCase,
    @inject(LOCALIZATION_TYPES.ApplyLocalizationUseCase)
    private readonly _applyLocalizationUseCase: ApplyLocalizationUseCase,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  get viewModel(): LocalizationViewModel {
    return { ...this._viewModel };
  }

  subscribe(callback: (vm: LocalizationViewModel) => void): () => void {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach(callback => callback(this.viewModel));
  }

  private _updateViewModel(updates: Partial<LocalizationViewModel>): void {
    this._viewModel = { ...this._viewModel, ...updates };
    this._notifySubscribers();
  }

  async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this._isInitialized) {
      this._logger.debug('[LocalizationPresenter] Already initialized, skipping');
      return;
    }

    this._logger.info('[LocalizationPresenter] Initializing localization');

    this._updateViewModel({ isLoading: true, error: null });

    try {
      // For client-side, try to detect user's preferred language from browser
      const userLanguage = this._detectUserLanguage();

      // If user has a preferred language, try to apply it
      if (userLanguage && ['en', 'ar'].includes(userLanguage)) {
        await this._applyLanguage(userLanguage);
      } else {
        // Default to English if no preference or unsupported language
        await this._applyLanguage('en');
      }

      this._isInitialized = true;
      this._logger.info('[LocalizationPresenter] Localization initialized successfully');
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error initializing localization', { error });
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async changeLanguage(languageCode: string): Promise<void> {
    // Validate input
    if (!languageCode || typeof languageCode !== 'string') {
      this._logger.error('[LocalizationPresenter] Invalid language code: must be a non-empty string', { languageCode });
      return;
    }

    // Validate language code format (ISO 639-1: 2-3 lowercase letters)
    if (!/^[a-z]{2,3}$/.test(languageCode)) {
      this._logger.error('[LocalizationPresenter] Invalid language code format: must be 2-3 lowercase letters', { languageCode });
      return;
    }

    // Prevent race conditions - if already changing language, ignore new requests
    if (this._isChangingLanguage) {
      this._logger.warn('[LocalizationPresenter] Language change already in progress, ignoring request', { languageCode });
      return;
    }

    this._isChangingLanguage = true;
    this._logger.info('[LocalizationPresenter] Changing language', { languageCode });

    this._updateViewModel({ isLoading: true, error: null });

    try {
      // Use ChangeActiveLanguageUseCase which will publish events
      const result = await this._changeActiveLanguageUseCase.execute({
        languageCode
      });

      if (isFailure(result)) {
        throw result.error;
      }

      const data = result.data;

      // Update view model with the localization data
      this._updateViewModel({
        isLoading: false,
        currentLanguage: {
          code: data.languageCode,
          name: '', // We don't need this on client side
          nativeName: '',
          direction: data.direction,
          isActive: true
        },
        translations: data.translations,
        direction: data.direction
      }); 

      this._logger.info('[LocalizationPresenter] Language changed successfully', { languageCode });
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error changing language', {
        languageCode,
        error
      });
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this._isChangingLanguage = false;
    }
  }

  private async _applyLanguage(languageCode: string): Promise<void> {
    // Get all translation keys that the app needs
    const translationKeys = this._getAppTranslationKeys();

    const applyResult = await this._applyLocalizationUseCase.execute({
      languageCode,
      translationKeys
    });

    if (applyResult.failure) {
      throw (applyResult as any).error;
    }

    const localizationData = (applyResult as any).data;

    this._updateViewModel({
      isLoading: false,
      currentLanguage: {
        code: localizationData.languageCode,
        name: '', // We don't need this on client side
        nativeName: '',
        direction: localizationData.direction,
        isActive: true
      },
      translations: localizationData.translations,
      direction: localizationData.direction
    });

    // Apply direction to document (only on client side)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dir = localizationData.direction;
      document.documentElement.lang = languageCode;
    } else {
      this._logger.warn('[LocalizationPresenter] Document not available, skipping DOM updates');
    }
  }

  private _detectUserLanguage(): string | null {
    // Check if we're on client side
    if (typeof navigator === 'undefined') {
      return null;
    }

    try {
      // Check navigator.language first, then navigator.languages
      const language = navigator.language || (navigator.languages && navigator.languages[0]);
      if (language) {
        // Extract just the language code (e.g., 'en-US' -> 'en')
        return language.split('-')[0].toLowerCase();
      }
    } catch (error) {
      this._logger.warn('[LocalizationPresenter] Failed to detect user language', { error });
    }
    return null;
  }

  private _getAppTranslationKeys(): string[] {
    // This should return all translation keys used in the app
    // For now, we'll use a hardcoded list based on our sample translations
    return [
      'auth.loginButton',
      'auth.logoutButton',
      'auth.appIdPlaceholder',
      'auth.userIdPlaceholder',
      'auth.submitButton',
      'auth.welcomeTitle',
      'auth.welcomeMessage',
      'auth.welcomeSubtitle',
      'auth.enterAppId',
      'auth.enterUserId',
      'auth.successMessage',
      'auth.loadingMessage',
      'auth.errorMessage',
      'auth.helpQuestion',
      'auth.helpAnswer',
      'auth.agreementText',
      'auth.privacyPolicy',
      'auth.termsOfService',
      'auth.refundPolicy',
      'products.title',
      'products.buyButton',
      'products.purchasedBadge',
      'products.emptyState',
      'products.loadingState',
      'offers.title',
      'offers.featuredTitle',
      'offers.emptyState',
      'offers.expiredBadge'
    ];
  }

  clearError(): void {
    this._updateViewModel({ error: null });
  }
}
