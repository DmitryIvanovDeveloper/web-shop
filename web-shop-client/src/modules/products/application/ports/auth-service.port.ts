/**
 * Port (Interface) для AuthService
 * Products модуль зависит ТОЛЬКО от этого интерфейса, НЕ от реализации
 * Реализация находится в Authentication модуле
 */

import type { AuthenticatedUserInfo } from '../../../authentication/application/services';

export interface AuthServicePort {
  /**
   * Проверка авторизации пользователя
   */
  isUserAuthenticated(): boolean;
  
  /**
   * Получение ID текущего пользователя
   * @returns userId или null если не авторизован
   */
  getCurrentUserId(): string | null;

  /**
   * Получение полной информации о текущем пользователе
   */
  getCurrentUser(): AuthenticatedUserInfo | null;
}


