/**
 * Session Storage Repository
 * Реализация SessionStoragePort для работы с localStorage
 */

import { injectable } from 'inversify';
import type { SessionStoragePort } from '../../application/ports/session-storage.port';
import type { AppUser } from '../../domain/types';

const STORAGE_KEY = 'app_user_session';

@injectable()
export class SessionStorageRepository implements SessionStoragePort {
  public async getStoredUser(): Promise<AppUser | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const user = JSON.parse(stored) as AppUser;
      return user;
    } catch (error) {
      console.error('[SessionStorageRepository] Failed to get stored user:', error);
      return null;
    }
  }

  public async saveUser(user: AppUser): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[SessionStorageRepository] Failed to save user:', error);
      throw error;
    }
  }

  public async clearUser(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[SessionStorageRepository] Failed to clear user:', error);
      throw error;
    }
  }
}

