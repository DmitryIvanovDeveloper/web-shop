/**
 * Port для Authentication Repository
 * Определяет контракт между Application и Infrastructure
 */

import { Result } from '../../../../shared/domain/result/result';
import { AppUser } from '../../domain/types';
import { UserNotFoundError } from '../../domain/errors/authentication.error';

export interface AuthRepositoryPort {
  /**
   * Проверить существует ли пользователь в Supabase для конкретного appId, если нет - создать (Supabase flow)
   * @param appId - ID приложения
   * @param userId - ID пользователя
   * @returns Result с AppUser, isNew и lastActiveAt (старое значение до обновления) или Error
   */
  ensureUserExists(
    appId: string,
    userId: string
  ): Promise<Result<{ user: AppUser; isNew: boolean; lastActiveAt?: string }, Error>>;
}
