

export const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  SessionStoragePort: Symbol.for('SessionStoragePort'),
  TryAuthenticateUseCase: Symbol.for('TryAuthenticateUseCase'),
  AuthPresenter: Symbol.for('AuthPresenter'),
  UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
    AuthService: Symbol.for('AuthService'),
    AuthenticationRequiredEventHandler: Symbol.for('AuthenticationRequiredEventHandler'),
  AuthenticationRequiredEventHandlerInterface: Symbol.for('IAsyncEventHandler<AuthenticationRequiredEvent>'),
  AppConfigLoadedEventHandler: Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'),
  LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>')
} as const;
