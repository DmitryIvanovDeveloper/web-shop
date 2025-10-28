/**
 * Port для Authentication Repository
 * Определяет контракт между Application и Infrastructure
 */

import { Result } from '../../../../shared/domain/result/result';
import { AppUser } from '../../domain/types';
import { UserNotFoundError } from '../../domain/errors/authentication.error';

export interface AuthRepositoryPort {
  /**
   * Валидация App ID и получение пользователя (Mock flow)
   * @param appId - ID приложения
   * @returns Result с AppUser или UserNotFoundError
   */
  validateAppId(appId: string): Promise<Result<AppUser, UserNotFoundError>>;
  
  /**
   * Проверить существует ли пользователь в Supabase, если нет - создать (Supabase flow)
   * @param appId - ID приложения
   * @param userId - ID пользователя
   * @returns Result с AppUser или Error
   */
  ensureUserExists(appId: string, userId: string): Promise<Result<AppUser, Error>>;
}

   * Проверить существует ли пользователь в Supabase, если нет - создать (Supabase flow)
   * @param appId - ID приложения
   * @param userId - ID пользователя
   * @returns Result с AppUser или Error
   */
  ensureUserExists(appId: string, userId: string): Promise<Result<AppUser, Error>>;
}
