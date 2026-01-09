export const LOCALIZATION_TYPES = {
  // Repositories
  LanguageRepository: Symbol.for('LanguageRepository'),
  TranslationRepository: Symbol.for('TranslationRepository'),

  // Use Cases
  ChangeActiveLanguageUseCase: Symbol.for('ChangeActiveLanguageUseCase'),
  GetLocalizationStatusUseCase: Symbol.for('GetLocalizationStatusUseCase'),
  UpdateTranslationsUseCase: Symbol.for('UpdateTranslationsUseCase'),

  // Presenters
  LocalizationPresenter: Symbol.for('LocalizationPresenter')
} as const;

