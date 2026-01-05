export const LOCALIZATION_TYPES = {
  // Repositories
  LanguageRepository: Symbol.for('LanguageRepository'),
  TranslationRepository: Symbol.for('TranslationRepository'),

  // Use Cases
  GetLocalizationStatusUseCase: Symbol.for('GetLocalizationStatusUseCase'),
  ApplyLocalizationUseCase: Symbol.for('ApplyLocalizationUseCase'),
  ChangeActiveLanguageUseCase: Symbol.for('ChangeActiveLanguageUseCase'),

  // Presenters
  LocalizationPresenter: Symbol.for('LocalizationPresenter')
} as const;