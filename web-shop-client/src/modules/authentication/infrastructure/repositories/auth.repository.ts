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
import { stringToDeterministicUuid } from '../../../../shared/utils/deterministic-uuid';

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
   * Проверить существует ли пользователь в Supabase, если нет - создать
   * @param appId - ID приложения
   * @param userId - ID пользователя (строка, будет конвертирована в UUID)
   */
  public async ensureUserExists(
    appId: string,
    userId: string
  ): Promise<Result<{ user: AppUser; isNew: boolean }, Error>> {
    try {
      const userUuid = stringToDeterministicUuid(userId);
      
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

      // 2. Если пользователь существует - обновляем last_active_at и возвращаем
      if (existingUser && !selectError) {
        // Store old last_active_at before updating (needed for calculating daysSinceLastActive)
        const oldLastActiveAt = existingUser.last_active_at;
        
        // Update last_active_at to track user activity
        await this._supabase
          .from('users')
          .update({ last_active_at: new Date().toISOString() })
          .eq('app_id', appId)
          .eq('user_id', userUuid);

        this._logger.info('[AuthRepository] User found in Supabase, last_active_at updated', { 
          appId, 
          userId,
          userUuid,
          dbId: existingUser.id,
          oldLastActiveAt,
        });
        
        // Convert oldLastActiveAt to ISO string if it exists
        const lastActiveAt = oldLastActiveAt 
          ? (oldLastActiveAt instanceof Date ? oldLastActiveAt.toISOString() : String(oldLastActiveAt))
          : undefined;

        return Result.ok({
          user: {
            userId: userId, // Возвращаем оригинальный userId (строку)
            appId: existingUser.app_id,
            username: `User-${userId.substring(0, 8)}`
          },
          isNew: false,
          lastActiveAt, // Return old last_active_at before update
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
          user_id: userUuid, // Используем UUID вместо строки
          last_active_at: new Date().toISOString() // Set last_active_at for new users
        })
        .select()
        .single();

      if (insertError) {
        // Handle race condition: if user was created by another request (409 conflict or duplicate key)
        // Try to fetch the user that was just created
        this._logger.error('[AuthRepository] Insert error - checking for conflict', {
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          checkingForConflict: true,
          appId,
          userId,
          userUuid,
        });

        if (insertError.code === '23505' || insertError.code === 'PGRST116' || insertError.message?.includes('duplicate') || insertError.message?.includes('already exists')) {
          this._logger.warn('[AuthRepository] User creation conflict (likely race condition), fetching existing user', { 
            errorCode: insertError.code,
            errorMessage: insertError.message,
            appId,
            userId,
            userUuid,
          });
          
          // Try to fetch the user that was just created
          const { data: existingUser, error: fetchError } = await this._supabase
            .from('users')
            .select('*')
            .eq('app_id', appId)
            .eq('user_id', userUuid)
            .single();
          
          if (existingUser && !fetchError) {
            // Update last_active_at for user found after conflict
            await this._supabase
              .from('users')
              .update({ last_active_at: new Date().toISOString() })
              .eq('app_id', appId)
              .eq('user_id', userUuid);

            this._logger.info('[AuthRepository] User found after conflict, treating as existing user, last_active_at updated', { 
              appId, 
              userId,
              userUuid,
              dbId: existingUser.id 
            });
            
            // Get old last_active_at before update
            const oldLastActiveAt = existingUser.last_active_at;
            const lastActiveAt = oldLastActiveAt 
              ? (oldLastActiveAt instanceof Date ? oldLastActiveAt.toISOString() : String(oldLastActiveAt))
              : undefined;

            return Result.ok({
              user: {
                userId: userId,
                appId: existingUser.app_id,
                username: `User-${userId.substring(0, 8)}`
              },
              isNew: false, // User already exists, not new
              lastActiveAt, // Return old last_active_at before update
            });
          }
        }
        
        this._logger.error('[AuthRepository] Failed to create user in Supabase', { 
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          appId,
          userId,
          userUuid,
        });
      return Result.error(new Error(`Failed to create user: ${insertError.message} (code: ${insertError.code})`));
      }

      this._logger.info('[AuthRepository] User created successfully in Supabase', { 
        appId, 
        userId,
        userUuid,
        dbId: newUser.id 
      });

      return Result.ok({
        user: {
          userId: userId, // Возвращаем оригинальный userId (строку), не UUID
          appId: newUser.app_id,
          username: `User-${userId.substring(0, 8)}`
        },
        isNew: true,
        lastActiveAt: undefined, // New users don't have old last_active_at
      });

    } catch (error) {
      this._logger.error('[AuthRepository] Error in ensureUserExists', { error, appId, userId });
      return Result.error(
        new Error(error instanceof Error ? error.message : 'Failed to ensure user exists')
      );
    }
  }
}
