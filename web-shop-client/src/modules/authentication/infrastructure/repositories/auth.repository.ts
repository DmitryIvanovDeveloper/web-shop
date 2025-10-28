/**
 * Repository для Authentication
 * Загружает данные через HttpClient (mock или real API)
 * Работает с Supabase для реальных пользователей
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AppUser } from '../../domain/types';
import { UserNotFoundError } from '../../domain/errors/authentication.error';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DatabaseClientPort } from '../../../../application/ports/database-client.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class AuthRepository implements AuthRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.DatabaseClient)
    private readonly _supabase: DatabaseClientPort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async validateAppId(appId: string): Promise<Result<AppUser, UserNotFoundError>> {
    try {
      // HttpClientMock автоматически мапит:
      // GET /api/auth/users -> /mocks/api/auth/users.json
      const response = await this._httpClient.get<Record<string, AppUser>>('/api/auth/users');

      if (response.status !== 200) {
        return Result.error(new UserNotFoundError(appId));
      }

      const users = response.data;
      const user = users[appId];

      if (!user) {
        return Result.error(new UserNotFoundError(appId));
      }

      return Result.ok(user);
    } catch (error) {
      this._logger.error('[AuthRepository] Error loading auth data:', error);
      return Result.error(new UserNotFoundError(appId));
    }
  }

  /**
   * Генерирует детерминированный UUID v5 из строки
   * Использует DNS namespace для консистентности
   */
  private _generateUuidFromString(str: string): string {
    // Простая хеш-функция для генерации UUID из строки
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Форматируем как UUID v4
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const uuid = `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-${(parseInt(hex.substring(0, 1), 16) & 0x3 | 0x8).toString(16)}${hex.substring(1, 4)}-${str.split('').reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '').substring(0, 12).padEnd(12, '0')}`;
    
    return uuid;
  }

  /**
   * Проверить существует ли пользователь в Supabase, если нет - создать
   * @param appId - ID приложения
   * @param userId - ID пользователя (строка, будет конвертирована в UUID)
   */
  public async ensureUserExists(appId: string, userId: string): Promise<Result<AppUser, Error>> {
    try {
      // Генерируем UUID из строки userId
      const userUuid = this._generateUuidFromString(userId);
      
      this._logger.info('[AuthRepository] Ensuring user exists in Supabase', { 
        appId, 
        userId: userId,
        userUuid: userUuid 
      });

      // 1. Проверяем существует ли пользователь
      const { data: existingUser, error: selectError } = await this._supabase
        .from('users')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userUuid)
        .single();

      // 2. Если пользователь существует - возвращаем
      if (existingUser && !selectError) {
        this._logger.info('[AuthRepository] User found in Supabase', { 
          appId, 
          userId,
          userUuid,
          dbId: existingUser.id 
        });
        
        return Result.ok({
          userId: userId, // Возвращаем оригинальный userId (строку)
          appId: existingUser.app_id,
          username: `User-${userId.substring(0, 8)}`
        });
      }

      // 3. Если пользователя нет (404 или другая ошибка) - создаем
      this._logger.info('[AuthRepository] User not found, creating new user in Supabase', { 
        appId, 
        userId,
        userUuid 
      });

      const { data: newUser, error: insertError } = await this._supabase
        .from('users')
        .insert({
          app_id: appId,
          user_id: userUuid // Используем UUID вместо строки
        })
        .select()
        .single();

      if (insertError) {
        this._logger.error('[AuthRepository] Failed to create user in Supabase', { 
          error: insertError,
          appId,
          userId 
        });
        return Result.error(new Error(`Failed to create user: ${insertError.message}`));
      }

      this._logger.info('[AuthRepository] User created successfully in Supabase', { 
        appId, 
        userId,
        userUuid,
        dbId: newUser.id 
      });

      return Result.ok({
        userId: userId, // Возвращаем оригинальный userId (строку), не UUID
        appId: newUser.app_id,
        username: `User-${userId.substring(0, 8)}`
      });

    } catch (error) {
      this._logger.error('[AuthRepository] Error in ensureUserExists', { error, appId, userId });
      return Result.error(
        new Error(error instanceof Error ? error.message : 'Failed to ensure user exists')
      );
    }
  }
}
