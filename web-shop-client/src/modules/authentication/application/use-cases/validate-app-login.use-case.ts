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

// Импорт AUTH_TYPES из bootstrap
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class ValidateAppLoginUseCase {
  constructor(
    @inject(AUTH_TYPES.AuthRepository)
    private readonly authRepository: AuthRepositoryPort
  ) {}

  async execute(
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
      // 2. Вызов через PORT (НЕ напрямую!)
      const result = await this.authRepository.validateAppId(trimmedAppId);

      // 3. Проверка результата через Result Pattern
      if (result.isFailure()) {
        return Result.error(result.error);
      }

      // 4. Успешная валидация
      if (result.isSuccess()) {
        return Result.ok(result.data);
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
