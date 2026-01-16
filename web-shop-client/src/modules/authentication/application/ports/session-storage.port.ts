/**
 * Port для Session Storage
 * Определяет контракт для работы с localStorage
 */

import { Result } from '../../../../shared/domain/result/result';
import { AppUser } from '../../domain/types';

export interface SessionStoragePort {
  /**
   * Сохранить пользователя в localStorage
   * @param user - Данные пользователя для сохранения
   * @returns Result с void или Error
   */
  save(user: AppUser): Promise<Result<void, Error>>;

  /**
   * Загрузить пользователя из localStorage
   * @returns Result с AppUser или null, или Error
   */
  load(): Promise<Result<AppUser | null, Error>>;

  /**
   * Очистить данные пользователя из localStorage
   * @returns Result с void или Error
   */
  clear(): Promise<Result<void, Error>>;
}


