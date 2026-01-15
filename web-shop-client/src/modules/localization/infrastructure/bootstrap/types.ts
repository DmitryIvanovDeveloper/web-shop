export const LOCALIZATION_TYPES = {
  // Repositories
  LanguageRepository: Symbol.for('LanguageRepository'),
  TranslationRepository: Symbol.for('TranslationRepository'),

  // Use Cases
  LoadLocalizationUseCase: Symbol.for('LoadLocalizationUseCase'),
  ChangeLocalizationUseCase: Symbol.for('ChangeLocalizationUseCase'),

  // Presenters
  LocalizationPresenter: Symbol.for('LocalizationPresenter'),

  // Event Handlers
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>')
} as const;