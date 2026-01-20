export const LOCALIZATION_TYPES = {
  
  LanguageRepository: Symbol.for('LanguageRepository'),
  TranslationRepository: Symbol.for('TranslationRepository'),

  ChangeActiveLanguageUseCase: Symbol.for('ChangeActiveLanguageUseCase'),
  GetLocalizationStatusUseCase: Symbol.for('GetLocalizationStatusUseCase'),
  UpdateTranslationsUseCase: Symbol.for('UpdateTranslationsUseCase'),

  LocalizationPresenter: Symbol.for('LocalizationPresenter')
} as const;

