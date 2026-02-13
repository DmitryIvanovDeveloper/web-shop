

import { Result } from '../../../../shared/result/result';
import { AppUser } from '../../domain/types';
import { UserNotFoundError } from '../../domain/errors/authentication.error';

export interface AuthRepositoryPort {
  
  ensureUserExists(
    appId: string,
    userId: string
  ): Promise<Result<{ user: AppUser; isNew: boolean; lastActiveAt?: string }, Error>>;
}
