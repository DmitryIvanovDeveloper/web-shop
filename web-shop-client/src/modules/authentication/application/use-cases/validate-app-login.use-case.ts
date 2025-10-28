/**
 * Use Case: Валидация App-Based Login
 * Координирует через порты (НЕ вызывает Domain напрямую)
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import type { AuthRepositoryPort } from '../ports/auth-repository.port';
import type { ValidateAppLoginRequest, AppUser } from '../../domain/types';
import { 
  InvalidAppIdError, 
  AppIdRequiredError,
  UserNotFoundError,
  AuthenticationError
} from '../../domain/errors/authentication.error';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { IEventBus } from '../../../../infrastructure/events/event-bus.plugin';
import type { Logger } from '../../../../application/ports/logger.port';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';

// Импорт AUTH_TYPES из bootstrap
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class ValidateAppLoginUseCase {
  constructor(
    @inject(AUTH_TYPES.AuthRepository)
    private readonly _authRepository: AuthRepositoryPort,
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: IEventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(
    request: ValidateAppLoginRequest
  ): Promise<Result<AppUser, AuthenticationError>> {
    // 1. Валидация входных данных
    if (!request.appId || request.appId.trim() === '') {
      return Result.error(new AppIdRequiredError());
    }

    const trimmedAppId = request.appId.trim();

    // Простая валидация формата (опционально)
    if (trimmedAppId.length < 3) {
      return Result.error(new InvalidAppIdError(trimmedAppId));
    }

    try {
      // 2. ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА: userId должен быть передан
      if (!request.userId) {
        this._logger.warn('[ValidateAppLoginUseCase] No userId provided, authentication not possible', { 
          appId: trimmedAppId 
        });
        return Result.error(
          new AuthenticationError('userId is required for authentication')
        );
      }

      // 3. SUPABASE FLOW - проверяем/создаем пользователя в Supabase
      this._logger.info('[ValidateAppLoginUseCase] Using Supabase flow', { 
        appId: trimmedAppId, 
        userId: request.userId 
      });
      
      const result = await this._authRepository.ensureUserExists(trimmedAppId, request.userId);

      // 4. Проверка результата через Result Pattern
      if (result.isFailure()) {
        return Result.error(result.error);
      }

      // 4. Успешная валидация
      if (result.isSuccess()) {
        const user = result.data;
        
        // Сохранение в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Публикация события для других модулей (межмодульное общение)
        this._logger.info('[ValidateAppLoginUseCase] Publishing UserAuthenticatedEvent');
        console.log('[ValidateAppLoginUseCase] Publishing UserAuthenticatedEvent', {
          userId: user.userId,
          username: user.username,
          appId: user.appId
        });
        await this._eventBus.publishAsync(
          new UserAuthenticatedEvent(
            user.userId,
            user.username,
            user.appId
          )
        );
        console.log('[ValidateAppLoginUseCase] Event published successfully');
        
        return Result.ok(user);
      }

      return Result.error(new AuthenticationError('Unknown error'));
      
    } catch (error) {
      // 5. Обработка неожиданных ошибок
      return Result.error(
        new AuthenticationError(
          error instanceof Error ? error.message : 'Validation failed'
        )
      );
    }
  }
}
