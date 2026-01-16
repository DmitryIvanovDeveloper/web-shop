/**
 * Use Case: Try authenticate user by appId and userId through repository (Supabase flow)
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import type { AuthRepositoryPort } from '../ports/auth-repository.port';
import type { SessionStoragePort } from '../ports/session-storage.port';
import type { AppUser } from '../../domain/types';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import type { IEventBus } from '../../../../infrastructure/events/event-bus.plugin';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { UserAuthenticatedEvent } from '../../domain/events';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class TryAuthenticateUseCase {
  constructor(
    @inject(AUTH_TYPES.AuthRepository)
    private readonly _authRepository: AuthRepositoryPort,
    @inject(AUTH_TYPES.SessionStoragePort)
    private readonly _sessionStorage: SessionStoragePort,
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: IEventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(appId: string, userId: string): Promise<Result<AppUser, AuthenticationError>> {
    console.log('[TryAuthenticateUseCase] execute called', { appId, userId });
    
    if (!appId?.trim() || !userId?.trim()) {
      console.log('[TryAuthenticateUseCase] Validation failed: appId or userId is empty');
      return Result.error(new AuthenticationError('appId and userId are required'));
    }

    try {
      console.log('[TryAuthenticateUseCase] Calling ensureUserExists');
      const result = await this._authRepository.ensureUserExists(appId.trim(), userId.trim());
      
      console.log('[TryAuthenticateUseCase] ensureUserExists result:', {
        isSuccess: result.isSuccess(),
        isFailure: result.isFailure(),
        hasData: !!result.data,
        hasError: !!result.error,
        errorMessage: result.error?.message
      });
      
      if (result.isFailure() || !result.data) {
        console.log('[TryAuthenticateUseCase] ensureUserExists failed, returning error');
        return Result.error(new AuthenticationError(result.error?.message || 'Authentication failed'));
      }

      const { user, isNew, lastActiveAt } = result.data;
      console.log('[TryAuthenticateUseCase] User data received:', {
        userId: user.userId,
        username: user.username,
        appId: user.appId,
        isNew
      });

      // Закомментировано: Сохранение пользователя в localStorage через SessionStoragePort
      // console.log('[TryAuthenticateUseCase] Saving user to session storage');
      // const saveResult = await this._sessionStorage.save(user);
      // if (saveResult.isFailure()) {
      //   this._logger.warn('[TryAuthenticateUseCase] Failed to save user to session storage', {
      //     error: saveResult.error?.message
      //   });
      //   console.warn('[TryAuthenticateUseCase] Failed to save user to session storage:', saveResult.error?.message);
      //   // Не прерываем процесс авторизации, если сохранение не удалось
      // } else {
      //   this._logger.info('[TryAuthenticateUseCase] User saved to session storage', {
      //     userId: user.userId,
      //     appId: user.appId
      //   });
      //   console.log('[TryAuthenticateUseCase] User saved to session storage successfully');
      // }

      console.log('[TryAuthenticateUseCase] Publishing UserAuthenticatedEvent');
      try {
        await this._eventBus.publishAsync(
          new UserAuthenticatedEvent(user.userId, user.username, user.appId, {
            isNewUser: isNew,
            lastActiveAt
          })
        );
        console.log('[TryAuthenticateUseCase] UserAuthenticatedEvent published');
      } catch (eventError) {
        // Ошибки в обработчиках событий не должны прерывать авторизацию
        // Пользователь уже создан/найден в Supabase
        this._logger.warn('[TryAuthenticateUseCase] Error in event handlers, but authentication succeeded', {
          error: eventError instanceof Error ? eventError.message : String(eventError)
        });
        console.warn('[TryAuthenticateUseCase] Error in event handlers, but authentication succeeded:', eventError);
      }

      const successResult: Result<AppUser, AuthenticationError> = Result.ok<AppUser, AuthenticationError>(user);
      console.log('[TryAuthenticateUseCase] Returning success result:', {
        isSuccess: successResult.isSuccess(),
        hasData: !!successResult.data,
        userId: successResult.data?.userId
      });
      return successResult;
    } catch (error) {
      console.error('[TryAuthenticateUseCase] Exception caught:', error);
      console.error('[TryAuthenticateUseCase] Exception details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
        error: error
      });
      this._logger.error('[TryAuthenticateUseCase] Unexpected error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return Result.error(new AuthenticationError(error instanceof Error ? error.message : 'Authentication failed'));
    }
  }
}

