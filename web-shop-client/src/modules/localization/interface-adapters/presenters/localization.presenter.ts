import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { LoadLocalizationUseCase, ChangeLocalizationUseCase } from '../../application/use-cases';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { LocalizationViewModel } from '../view-models/localization.view-model';
// Removed import - isFailure is now a getter on Result objects

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

  constructor(
    @inject(LOCALIZATION_TYPES.LoadLocalizationUseCase)
    private readonly _loadLocalizationUseCase: LoadLocalizationUseCase,
    @inject(LOCALIZATION_TYPES.ChangeLocalizationUseCase)
    private readonly _changeLocalizationUseCase: ChangeLocalizationUseCase,
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

  async loadLocalization(languageCode?: string): Promise<void> {
    this._logger.info('[LocalizationPresenter] Loading localization', { languageCode });

    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._loadLocalizationUseCase.execute({ languageCode });

      if (result.isFailure) {
        throw result.error;
      }

            this._logger.info('[LocalizationPresenter] Localization load completed');
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Failed to load localization', { error });
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async changeLocalization(languageCode: string): Promise<void> {
        if (!languageCode || typeof languageCode !== 'string') {
      this._logger.error('[LocalizationPresenter] Invalid language code: must be a non-empty string', { languageCode });
      return;
    }

        if (!/^[a-z]{2,3}$/.test(languageCode)) {
      this._logger.error('[LocalizationPresenter] Invalid language code format: must be 2-3 lowercase letters', { languageCode });
      return;
    }

    this._logger.info('[LocalizationPresenter] Changing localization', { languageCode });

    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._changeLocalizationUseCase.execute({ languageCode });

      if (result.isFailure) {
        throw result.error;
      }

            this._logger.info('[LocalizationPresenter] Localization change completed');
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Failed to change localization', { error });
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  
  async changeLanguage(languageCode: string): Promise<void> {
    this._logger.info('[LocalizationPresenter] changeLanguage called (alias)', { languageCode });
    await this.changeLocalization(languageCode);
    this._logger.info('[LocalizationPresenter] changeLanguage completed (alias)', { languageCode });
  }

  updateFromEvent(translations: Record<string, string>, languageCode: string, direction: 'ltr' | 'rtl'): void {
    this._logger.info('[LocalizationPresenter] Updating from localization loaded event', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length
    });

    this._updateViewModel({
      isLoading: false,
      currentLanguage: {
        code: languageCode,
        name: '',         nativeName: '',
        direction,
        isActive: true
      },
      translations,
      direction
    });

        if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dir = direction;
      document.documentElement.lang = languageCode;
    }
  }



}
