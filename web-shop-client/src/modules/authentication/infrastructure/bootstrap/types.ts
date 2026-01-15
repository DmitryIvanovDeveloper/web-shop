/**
 * DI Types для Authentication Module
 */

export const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  SessionStoragePort: Symbol.for('SessionStoragePort'),
  TryAuthenticateUseCase: Symbol.for('TryAuthenticateUseCase'),
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
