

import { injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { SessionStoragePort } from '../../application/ports/session-storage.port';
import { AppUser } from '../../domain/types';

const STORAGE_KEY = 'user';

@injectable()
export class SessionStorageRepository implements SessionStoragePort {
  async save(user: AppUser): Promise<Result<void, Error>> {
    try {
      if (typeof window === 'undefined') {
        return Result.error(new Error('localStorage is not available (server-side)'));
      }

      const userData = {
        userId: user.userId,
        appId: user.appId,
        username: user.username
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async load(): Promise<Result<AppUser | null, Error>> {
    try {
      if (typeof window === 'undefined') {
        return Result.ok(null);
      }

      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (!storedUser) {
        return Result.ok(null);
      }

      const user = JSON.parse(storedUser);
      
            if (!user?.userId || !user?.appId || !user?.username) {
                localStorage.removeItem(STORAGE_KEY);
        return Result.ok(null);
      }

      const appUser: AppUser = {
        userId: user.userId,
        appId: user.appId,
        username: user.username
      };

      return Result.ok(appUser);
    } catch (error) {
            if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      if (typeof window === 'undefined') {
        return Result.ok(undefined);
      }

      localStorage.removeItem(STORAGE_KEY);
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
}


