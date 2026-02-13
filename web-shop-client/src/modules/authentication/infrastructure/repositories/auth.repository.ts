

import { injectable, inject } from 'inversify';
import { Result } from '../../../shared/result/result';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AppUser } from '../../domain/types';
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

            const { data: existingUser, error: selectError } = await this._supabase
        .from('users')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userUuid)
        .maybeSingle();

            this._logger.info('[AuthRepository] Supabase query result', {
        hasData: !!existingUser,
        hasError: !!selectError,
        errorCode: selectError?.code,
        errorMessage: selectError?.message,
        userId,
        userUuid
      });
                  if (existingUser && !selectError) {
                const oldLastActiveAt = existingUser.last_active_at;
        
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
        
                const lastActiveAt = oldLastActiveAt 
          ? (oldLastActiveAt instanceof Date ? oldLastActiveAt.toISOString() : String(oldLastActiveAt))
          : undefined;

        return Result.ok({
          user: {
            userId: userId,             appId: existingUser.app_id,
            username: userId           },
          isNew: false,
          lastActiveAt,         });
      }

                        this._logger.info('[AuthRepository] User not found (existingUser is null), automatically creating new user in Supabase', { 
        appId, 
        userId,
        userUuid,
        hadSelectError: !!selectError,
        selectErrorCode: selectError?.code,
        selectErrorMessage: selectError?.message
      });

      const { data: newUser, error: insertError } = await this._supabase
        .from('users')
        .insert({
          app_id: appId,
          user_id: userUuid,           last_active_at: new Date().toISOString()         })
        .select()
        .single();

      if (insertError) {
                        this._logger.warn('[AuthRepository] Insert error occurred, checking if user was created anyway (race condition or retry)', {
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          appId,
          userId,
          userUuid,
        });

                        const isConflictError = insertError.code === '23505' || 
                                insertError.code === 'PGRST116' || 
                                insertError.message?.includes('duplicate') || 
                                insertError.message?.includes('already exists');
        
        if (isConflictError) {
          this._logger.info('[AuthRepository] Conflict error detected, fetching existing user', { 
            errorCode: insertError.code,
            errorMessage: insertError.message,
            appId,
            userId,
            userUuid,
          });
        } else {
          this._logger.info('[AuthRepository] Non-conflict error, but checking if user exists anyway (may have been created)', { 
            errorCode: insertError.code,
            errorMessage: insertError.message,
            appId,
            userId,
            userUuid,
          });
        }
        
                const { data: existingUserAfterError, error: fetchError } = await this._supabase
          .from('users')
          .select('*')
          .eq('app_id', appId)
          .eq('user_id', userUuid)
          .maybeSingle();
        
        if (existingUserAfterError && !fetchError) {
                              await this._supabase
            .from('users')
            .update({ last_active_at: new Date().toISOString() })
            .eq('app_id', appId)
            .eq('user_id', userUuid);

          this._logger.info('[AuthRepository] User found after insert error, treating as existing user, last_active_at updated', { 
            appId, 
            userId,
            userUuid,
            dbId: existingUserAfterError.id,
            originalErrorCode: insertError.code,
            originalErrorMessage: insertError.message
          });
          
                    const oldLastActiveAt = existingUserAfterError.last_active_at;
          const lastActiveAt = oldLastActiveAt 
            ? (oldLastActiveAt instanceof Date ? oldLastActiveAt.toISOString() : String(oldLastActiveAt))
            : undefined;

          return Result.ok({
            user: {
              userId: userId,
              appId: existingUserAfterError.app_id,
              username: userId             },
            isNew: false,             lastActiveAt,           });
        }
        
                this._logger.error('[AuthRepository] Failed to create user in Supabase and user still not found after retry', { 
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
          errorHint: insertError.hint,
          appId,
          userId,
          userUuid,
          userNotFoundAfterRetry: true
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
          userId: userId,           appId: newUser.app_id,
          username: userId         },
        isNew: true,
        lastActiveAt: undefined,       });

    } catch (error) {
            console.error('[AuthRepository] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
        error: error,
        appId,
        userId
      });
      this._logger.error('[AuthRepository] Error in ensureUserExists', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        appId, 
        userId 
      });
      return Result.error(
        new Error(error instanceof Error ? error.message : 'Failed to ensure user exists')
      );
    }
  }
}
