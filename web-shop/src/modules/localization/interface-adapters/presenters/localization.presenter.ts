import { inject, injectable } from 'inversify';

import type { LocalizationViewModel } from '../view-models/localization.view-model';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { ChangeActiveLanguageUseCase, GetLocalizationStatusUseCase, UpdateTranslationsUseCase } from '../../application/use-cases';
import type { TranslationRepositoryPort } from '../../application/ports/translation-repository.port';

@injectable()
export class LocalizationPresenter {
  private _viewModel: LocalizationViewModel = {
    isLoading: false,
    error: null,
    activeLanguage: null,
    supportedLanguages: [],
    translations: [],
    translationCoverage: {
      totalKeys: 0,
      translatedKeys: 0,
      coveragePercentage: 0
    },
    incompleteLanguages: []
  };

  private _subscribers: Array<(vm: LocalizationViewModel) => void> = [];

  constructor(
    @inject(LOCALIZATION_TYPES.ChangeActiveLanguageUseCase)
    private readonly _changeActiveLanguageUseCase: ChangeActiveLanguageUseCase,
    @inject(LOCALIZATION_TYPES.GetLocalizationStatusUseCase)
    private readonly _getLocalizationStatusUseCase: GetLocalizationStatusUseCase,
    @inject(LOCALIZATION_TYPES.UpdateTranslationsUseCase)
    private readonly _updateTranslationsUseCase: UpdateTranslationsUseCase,
    @inject(LOCALIZATION_TYPES.TranslationRepository)
    private readonly _translationRepository: TranslationRepositoryPort
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

  async loadLocalizationStatus(): Promise<void> {
    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._getLocalizationStatusUseCase.execute();

      if (result.isFailure) {
        this._updateViewModel({
          isLoading: false,
          error: result.error?.message || 'Unknown error'
        });
        return;
      }

      const status = result.value!;

      const allTranslationsPromises = status.supportedLanguages.map(async (lang) => {
        const translationsResult = await this._translationRepository.getTranslationsByLanguage(lang.code);
        return translationsResult.isSuccess ? translationsResult.value! : [];
      });

      const allTranslationsArrays = await Promise.all(allTranslationsPromises);
      const allTranslations = allTranslationsArrays.flat();

      const translations = allTranslations.map((t: any) => ({
        key: t.key.value,
        languageCode: t.languageCode.value,
        value: t.value,
        isTranslated: t.value && t.value.length > 0
      }));

      const newViewModel = {
        isLoading: false,
        activeLanguage: status.activeLanguage,
        supportedLanguages: status.supportedLanguages,
        translations: translations,
        translationCoverage: status.translationCoverage,
        incompleteLanguages: status.incompleteLanguages
      };

      this._updateViewModel(newViewModel);
    } catch (error) {
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async changeActiveLanguage(languageCode: string): Promise<void> {
    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._changeActiveLanguageUseCase.execute({ languageCode });

      if (result.isFailure) {
        this._updateViewModel({
          isLoading: false,
          error: result.error?.message || 'Unknown error'
        });
        return;
      }

      await this.loadLocalizationStatus();
    } catch (error) {
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateTranslations(updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>): Promise<void> {
    this._updateViewModel({ isLoading: true, error: null });

    try {
      const result = await this._updateTranslationsUseCase.execute({ translations: updates });

      if (result.isFailure) {
        this._updateViewModel({
          isLoading: false,
          error: result.error?.message || 'Unknown error'
        });
        return;
      }

      await this.loadLocalizationStatus();
    } catch (error) {
      this._updateViewModel({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  clearError(): void {
    this._updateViewModel({ error: null });
  }
}
