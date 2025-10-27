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
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@injectable()
export class AuthRepository implements AuthRepositoryPort {
  private _supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    // Инициализация Supabase client
    this._supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

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
   * Проверить существует ли пользователь в Supabase, если нет - создать
   * @param appId - ID приложения
   * @param userId - ID пользователя
   */
  public async ensureUserExists(appId: string, userId: string): Promise<Result<AppUser, Error>> {
    try {
      this._logger.info('[AuthRepository] Ensuring user exists in Supabase', { appId, userId });

      // 1. Проверяем существует ли пользователь
      const { data: existingUser, error: selectError } = await this._supabase
        .from('users')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userId)
        .single();

      // 2. Если пользователь существует - возвращаем
      if (existingUser && !selectError) {
        this._logger.info('[AuthRepository] User found in Supabase', { 
          appId, 
          userId,
          dbId: existingUser.id 
        });
        
        return Result.ok({
          userId: existingUser.user_id,
          appId: existingUser.app_id,
          username: `User-${userId.substring(0, 8)}`
        });
      }

      // 3. Если пользователя нет (404 или другая ошибка) - создаем
      this._logger.info('[AuthRepository] User not found, creating new user in Supabase', { 
        appId, 
        userId 
      });

      const { data: newUser, error: insertError } = await this._supabase
        .from('users')
        .insert({
          app_id: appId,
          user_id: userId
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
        dbId: newUser.id 
      });

      return Result.ok({
        userId: newUser.user_id,
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
