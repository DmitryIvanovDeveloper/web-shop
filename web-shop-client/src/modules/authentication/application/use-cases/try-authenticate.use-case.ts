

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result/result';
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
        if (!appId?.trim() || !userId?.trim()) {
            return Result.error(new AuthenticationError('appId and userId are required'));
    }

    try {
            const result = await this._authRepository.ensureUserExists(appId.trim(), userId.trim());
      
      console.log('[TryAuthenticateUseCase] ensureUserExists result:', {
        isSuccess: result.isSuccess,
        isFailure: result.isFailure,
        hasData: !!result.value,
        hasError: !!result.error,
        errorMessage: result.error?.message
      });
      
      if (result.isFailure || !result.value) {
                return Result.error(new AuthenticationError(result.error?.message || 'Authentication failed'));
      }

      const { user, isNew, lastActiveAt } = result.value;
                                                                                    
            try {
        await this._eventBus.publishAsync(
          new UserAuthenticatedEvent(user.userId, user.username, user.appId, {
            isNewUser: isNew,
            lastActiveAt
          })
        );
              } catch (eventError) {
                        this._logger.warn('[TryAuthenticateUseCase] Error in event handlers, but authentication succeeded', {
          error: eventError instanceof Error ? eventError.message : String(eventError)
        });
              }

      const successResult: Result<AppUser, AuthenticationError> = Result.ok<AppUser, AuthenticationError>(user);
      console.log('[TryAuthenticateUseCase] Returning success result:', {
        isSuccess: successResult.isSuccess,
        hasData: !!successResult.value,
        userId: successResult.value?.userId
      });
      return successResult;
    } catch (error) {
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

