export const LOCALIZATION_TYPES = {
    LanguageRepository: Symbol.for('LanguageRepository'),
  TranslationRepository: Symbol.for('TranslationRepository'),

    LoadLocalizationUseCase: Symbol.for('LoadLocalizationUseCase'),
  ChangeLocalizationUseCase: Symbol.for('ChangeLocalizationUseCase'),

    LocalizationPresenter: Symbol.for('LocalizationPresenter'),

    LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>')
} as const;