import type { AppUser } from '../../domain/types';

/**
 * Port для работы с хранилищем сессии
 * Определяет контракт для сохранения и восстановления пользовательской сессии
 */
export interface SessionStoragePort {
  /**
   * Получить сохраненного пользователя из хранилища
   * @returns Пользователь или null, если сессия не найдена
   */
  getStoredUser(): Promise<AppUser | null>;

  /**
   * Сохранить пользователя в хранилище
   * @param user Пользователь для сохранения
   */
  saveUser(user: AppUser): Promise<void>;

  /**
   * Очистить хранилище от данных пользователя
   */
  clearUser(): Promise<void>;
}
