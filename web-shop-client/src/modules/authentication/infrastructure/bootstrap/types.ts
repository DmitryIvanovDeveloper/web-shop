/**
 * DI Types для Authentication Module
 */

export const AUTH_TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  ValidateAppLoginUseCase: Symbol.for('ValidateAppLoginUseCase'),
  AuthPresenter: Symbol.for('AuthPresenter')
} as const;
