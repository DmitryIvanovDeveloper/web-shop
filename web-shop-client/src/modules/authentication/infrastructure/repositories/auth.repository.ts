/**
 * Repository для Authentication
 * Загружает данные через HttpClient (mock или real API)
 */

import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { AuthRepositoryPort } from '../../application/ports/auth-repository.port';
import { AppUser } from '../../domain/types';
import { UserNotFoundError } from '../../domain/errors/authentication.error';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

@injectable()
export class AuthRepository implements AuthRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  async validateAppId(appId: string): Promise<Result<AppUser, UserNotFoundError>> {
    try {
      // HttpClientMock автоматически мапит:
      // GET /api/auth/users -> /mocks/api/auth/users.json
      const response = await this.httpClient.get<Record<string, AppUser>>('/api/auth/users');

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
      console.error('Error loading auth data:', error);
      return Result.error(new UserNotFoundError(appId));
    }
  }
}
