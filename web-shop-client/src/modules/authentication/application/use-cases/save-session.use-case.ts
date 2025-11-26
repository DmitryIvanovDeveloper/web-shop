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
    // Session persistence to localStorage is disabled by design for now.
    // We keep this use case to satisfy dependencies but skip actual storage operations.
    this._logger.info('[SaveSessionUseCase] Skipping session save (localStorage disabled)', {
      userId: user.userId
    });
    return Result.ok(undefined);
  }
}
