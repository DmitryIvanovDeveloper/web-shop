/**
 * Use Case: Восстановление сессии из хранилища
 * Координирует через порты (НЕ вызывает Domain напрямую)
 * Публикует UserAuthenticatedEvent для уведомления других модулей
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import type { SessionStoragePort } from '../ports/session-storage.port';
import type { AuthRepositoryPort } from '../ports/auth-repository.port';
import type { AppUser } from '../../domain/types';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { IEventBus } from '../../../../infrastructure/events/event-bus.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';

@injectable()
export class RestoreSessionUseCase {
  constructor(
    @inject(AUTH_TYPES.SessionStorage)
    private readonly _sessionStorage: SessionStoragePort,
    @inject(AUTH_TYPES.AuthRepository)
    private readonly _authRepository: AuthRepositoryPort,
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: IEventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(): Promise<Result<AppUser, AuthenticationError>> {
    this._logger.info('[RestoreSessionUseCase] Attempting to restore session from storage');

    try {
      // 1. Восстанавливаем пользователя из localStorage
      const user = await this._sessionStorage.getStoredUser();

      if (!user) {
        this._logger.info('[RestoreSessionUseCase] No user found in storage');
        return Result.error(
          new AuthenticationError('No session found in storage')
        );
      }

      // 2. Валидация данных пользователя
      if (!user.userId || !user.appId || !user.username) {
        this._logger.warn('[RestoreSessionUseCase] Invalid user data in storage', { user });
        await this._sessionStorage.clearUser();
        return Result.error(
          new AuthenticationError('Invalid session data in storage')
        );
      }

      this._logger.info('[RestoreSessionUseCase] Session restored from storage, checking user in database', {
        userId: user.userId,
        appId: user.appId
      });

      // 3. Проверяем/обновляем пользователя в БД для получения isNew и lastActiveAt
      const ensureResult = await this._authRepository.ensureUserExists(user.appId, user.userId);
      
      if (ensureResult.isFailure()) {
        this._logger.warn('[RestoreSessionUseCase] Failed to ensure user exists in database, but continuing with restored session', {
          error: ensureResult.error
        });
        // Продолжаем с восстановленным пользователем, но без isNew/lastActiveAt
        // Публикуем событие с isNewUser: false (предполагаем, что это возвращающийся пользователь)
        await this._eventBus.publishAsync(
          new UserAuthenticatedEvent(
            user.userId,
            user.username,
            user.appId,
            { isNewUser: false }
          )
        );
        return Result.ok(user);
      }

      // 4. Получаем данные о пользователе из БД
      if (!ensureResult.data) {
        this._logger.warn('[RestoreSessionUseCase] ensureUserExists returned success but data is undefined');
        // Публикуем событие с isNewUser: false (предполагаем, что это возвращающийся пользователь)
        await this._eventBus.publishAsync(
          new UserAuthenticatedEvent(
            user.userId,
            user.username,
            user.appId,
            { isNewUser: false }
          )
        );
        return Result.ok(user);
      }

      const { user: dbUser, isNew, lastActiveAt } = ensureResult.data;

      this._logger.info('[RestoreSessionUseCase] User verified in database, publishing UserAuthenticatedEvent', {
        userId: dbUser.userId,
        appId: dbUser.appId,
        isNew,
        lastActiveAt
      });

      // 5. Публикуем UserAuthenticatedEvent для уведомления других модулей
      await this._eventBus.publishAsync(
        new UserAuthenticatedEvent(
          dbUser.userId,
          dbUser.username,
          dbUser.appId,
          { isNewUser: isNew, lastActiveAt }
        )
      );

      this._logger.info('[RestoreSessionUseCase] Session restored and event published successfully');

      return Result.ok(dbUser);
    } catch (error) {
      this._logger.error('[RestoreSessionUseCase] Failed to restore session', { error });
      return Result.error(
        new AuthenticationError(
          error instanceof Error ? error.message : 'Failed to restore session'
        )
      );
    }
  }
}
