/**
 * Use Case: Сохранение сессии в хранилище
 * Координирует через порты (НЕ вызывает Domain напрямую)
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import type { SessionStoragePort } from '../ports/session-storage.port';
import type { AppUser } from '../../domain/types';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class SaveSessionUseCase {
  constructor(
    @inject(AUTH_TYPES.SessionStorage)
    private readonly _sessionStorage: SessionStoragePort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(user: AppUser): Promise<Result<void, AuthenticationError>> {
    this._logger.info('[SaveSessionUseCase] Attempting to save session', { userId: user.userId });

    try {
      await this._sessionStorage.saveUser(user);
      this._logger.info('[SaveSessionUseCase] Session saved successfully', { userId: user.userId });
      return Result.ok(undefined);
    } catch (error) {
      this._logger.error('[SaveSessionUseCase] Failed to save session', { error });
      return Result.error(
        new AuthenticationError(
          error instanceof Error ? error.message : 'Failed to save session'
        )
      );
    }
  }
}
