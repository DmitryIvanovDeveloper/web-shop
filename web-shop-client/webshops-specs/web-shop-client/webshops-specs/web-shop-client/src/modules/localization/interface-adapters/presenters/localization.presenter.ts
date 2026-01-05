import { inject, injectable } from 'inversify';
import type { GetLocalizationStatusUseCase, GetLocalizationStatusRequest } from '../../application/use-cases/get-localization-status.use-case';
import type { ApplyLocalizationUseCase, ApplyLocalizationRequest } from '../../application/use-cases/apply-localization.use-case';
import type { ChangeActiveLanguageUseCase, ChangeActiveLanguageRequest } from '../../application/use-cases/change-active-language.use-case';
import type { UpdateTranslationsUseCase, UpdateTranslationsRequest } from '../../application/use-cases/update-translations.use-case';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { LocalizationViewModel } from '../view-models/localization.view-model';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class LocalizationPresenter {
  private _viewModel: LocalizationViewModel = {
    isLoading: true,
    error: null,
    currentLanguage: null,
    translations: {},
    direction: 'ltr'
  };

  private _listeners: Array<(vm: LocalizationViewModel) => void> = [];

  constructor(
    @inject(LOCALIZATION_TYPES.GetLocalizationStatusUseCase)
    private readonly _getLocalizationStatusUseCase: GetLocalizationStatusUseCase,
    @inject(LOCALIZATION_TYPES.ApplyLocalizationUseCase)
    private readonly _applyLocalizationUseCase: ApplyLocalizationUseCase,
    @inject(LOCALIZATION_TYPES.ChangeActiveLanguageUseCase)
    private readonly _changeActiveLanguageUseCase: ChangeActiveLanguageUseCase,
    @inject(LOCALIZATION_TYPES.UpdateTranslationsUseCase)
    private readonly _updateTranslationsUseCase: UpdateTranslationsUseCase,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  get viewModel(): LocalizationViewModel {
    return this._viewModel;
  }

  subscribe(listener: (vm: LocalizationViewModel) => void): () => void {
    this._listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private _notifyListeners(): void {
    this._listeners.forEach(listener => listener(this._viewModel));
  }

  private _updateViewModel(update: Partial<LocalizationViewModel>): void {
    this._viewModel = { ...this._viewModel, ...update };
    this._notifyListeners();
  }

  async initialize(): Promise<void> {
    await this.loadLocalizationStatus();
  }

  async loadLocalizationStatus(): Promise<void> {
    try {
      this._updateViewModel({ isLoading: true, error: null });

      const result = await this._getLocalizationStatusUseCase.execute();

      if (result.isFailure) {
        this._logger.error('[LocalizationPresenter] Failed to load localization status', { error: result.error });
        this._updateViewModel({ 
          isLoading: false, 
          error: result.error?.message || 'Failed to load localization status' 
        });
        return;
      }

      const status = result.data;

      this._updateViewModel({
        isLoading: false,
        error: null,
        currentLanguage: status.activeLanguage,
        direction: status.activeLanguage?.direction || 'ltr'
      });

      this._logger.info('[LocalizationPresenter] Localization status loaded successfully');
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error loading localization status', { error });
      this._updateViewModel({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  async changeLanguage(languageCode: string): Promise<void> {
    try {
      this._updateViewModel({ isLoading: true, error: null });

      const result = await this._changeActiveLanguageUseCase.execute({ languageCode });

      if (result.isFailure) {
        this._logger.error('[LocalizationPresenter] Failed to change language', { languageCode, error: result.error });
        this._updateViewModel({ 
          isLoading: false, 
          error: result.error?.message || 'Failed to change language' 
        });
        return;
      }

      // Reload status to get updated data
      await this.loadLocalizationStatus();

      this._logger.info('[LocalizationPresenter] Language changed successfully', { languageCode });
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error changing language', { languageCode, error });
      this._updateViewModel({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  async updateTranslations(languageCode: string, updates: Array<{ key: string; value: string }>): Promise<void> {
    try {
      this._updateViewModel({ isLoading: true, error: null });

      const result = await this._updateTranslationsUseCase.execute({ languageCode, updates });

      if (result.isFailure) {
        this._logger.error('[LocalizationPresenter] Failed to update translations', { languageCode, error: result.error });
        this._updateViewModel({ 
          isLoading: false, 
          error: result.error?.message || 'Failed to update translations' 
        });
        return;
      }

      this._updateViewModel({ isLoading: false });

      this._logger.info('[LocalizationPresenter] Translations updated successfully', { 
        languageCode, 
        updatedCount: result.data.updatedCount 
      });
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error updating translations', { languageCode, error });
      this._updateViewModel({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  async applyLocalization(languageCode: string, translationKeys: string[]): Promise<void> {
    try {
      const result = await this._applyLocalizationUseCase.execute({ languageCode, translationKeys });

      if (result.isFailure) {
        this._logger.error('[LocalizationPresenter] Failed to apply localization', { languageCode, error: result.error });
        return;
      }

      const localizationData = result.data;

      // Update view model with translations
      this._updateViewModel({
        currentLanguage: {
          code: localizationData.languageCode,
          name: '', // We don't have this info here
          nativeName: '',
          direction: localizationData.direction
        },
        translations: localizationData.translations,
        direction: localizationData.direction
      });

      this._logger.info('[LocalizationPresenter] Localization applied successfully', { languageCode });
    } catch (error) {
      this._logger.error('[LocalizationPresenter] Unexpected error applying localization', { languageCode, error });
    }
  }

  clearError(): void {
    this._updateViewModel({ error: null });
  }
}
