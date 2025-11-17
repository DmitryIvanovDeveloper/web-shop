/**
 * Application Service для Authentication модуля
 * Экспортирует функциональность модуля для использования другими модулями
 * @injectable - регистрируется в DI
 */

import { injectable, inject } from 'inversify';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthPresenter } from '../../interface-adapters/presenters/auth.presenter';

/**
 * Port (Interface) для изоляции модулей
 * Другие модули зависят от этого интерфейса, НЕ от реализации
 */
export interface AuthenticatedUserInfo {
  readonly userId: string;
  readonly appId: string;
  readonly username: string;
}

export interface AuthServicePort {
  isUserAuthenticated(): boolean;
  getCurrentUserId(): string | null;
  getCurrentUser(): AuthenticatedUserInfo | null;
}

/**
 * Реализация AuthService
 * Инкапсулирует доступ к AuthPresenter для внешних модулей
 */
@injectable()
export class AuthService implements AuthServicePort {
  constructor(
    @inject(AUTH_TYPES.AuthPresenter)
    private readonly _authPresenter: AuthPresenter
  ) {}

  /**
   * Проверка авторизации пользователя
   */
  public isUserAuthenticated(): boolean {
    return this._authPresenter.isUserAuthenticated();
  }

  /**
   * Получение ID текущего пользователя
   */
  public getCurrentUserId(): string | null {
    const user = this._authPresenter.getCurrentUser();
    return user?.userId || null;
  }

  public getCurrentUser(): AuthenticatedUserInfo | null {
    const user = this._authPresenter.getCurrentUser();
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      appId: user.appId,
      username: user.username,
    };
  }
}



