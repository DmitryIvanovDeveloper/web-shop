/**
 * DI Types для Authentication Module
 */

export const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  ValidateAppLoginUseCase: Symbol.for('ValidateAppLoginUseCase'),
  AuthPresenter: Symbol.for('AuthPresenter'),
  UserAuthenticatedHandler: Symbol.for('IAsyncEventHandler<UserAuthenticatedEvent>'),
  // Auth UI Types
  AuthUIRepository: Symbol.for('AuthUIRepository'),
  LoadAuthUIConfigUseCase: Symbol.for('LoadAuthUIConfigUseCase'),
  // Application Service (для экспорта функциональности модуля)
  AuthService: Symbol.for('AuthService'),
  // Event Handler для AuthenticationRequiredEvent
  AuthenticationRequiredEventHandler: Symbol.for('AuthenticationRequiredEventHandler')
} as const;
