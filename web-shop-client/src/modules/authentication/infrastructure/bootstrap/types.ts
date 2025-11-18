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
  // Event Handler для AuthenticationRequiredEvent
  AuthenticationRequiredEventHandler: Symbol.for('AuthenticationRequiredEventHandler')
} as const;
