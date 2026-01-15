/**
 * DI Types для Authentication Module
 */

export const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  ValidateAppLoginUseCase: Symbol.for('ValidateAppLoginUseCase'),
  RestoreSessionUseCase: Symbol.for('RestoreSessionUseCase'),
  SaveSessionUseCase: Symbol.for('SaveSessionUseCase'),
  SessionStorage: Symbol.for('SessionStorage'),
  AuthPresenter: Symbol.for('AuthPresenter'),
  UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
  // Application Service (для экспорта функциональности модуля)
  AuthService: Symbol.for('AuthService'),
  // Event Handlers
  AuthenticationRequiredEventHandler: Symbol.for('AuthenticationRequiredEventHandler'),
  AuthenticationRequiredEventHandlerInterface: Symbol.for('IAsyncEventHandler<AuthenticationRequiredEvent>'),
  AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>')
} as const;
