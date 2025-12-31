import { injectable } from 'inversify';
import { BrowserPort, CurrentUser, AppConfig } from '../../application/ports/browser.port';

/**
 * Browser Service Implementation
 * 
 * Infrastructure implementation of BrowserPort using browser APIs
 * Handles browser-specific operations through abstraction
 */
@injectable()
export class BrowserService implements BrowserPort {
  /**
   * Check if running in browser environment
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Get current user from localStorage
   */
  async getCurrentUser(): Promise<CurrentUser | null> {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);
      return {
        userId: user.userId,
        username: user.username,
        appId: user.appId
      };
    } catch {
      return null;
    }
  }

  /**
   * Get temporary user ID from localStorage
   */
  getTempUserId(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('temp_user_id');
  }

  /**
   * Get application configuration from environment
   */
  getAppConfig(): AppConfig {
    const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3002';
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'web-shop-client';

    console.log('[BrowserService.getAppConfig] Raw env values:', {
      NEXT_PUBLIC_PAYMENT_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
      NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
      paymentServiceUrl,
      appId
    });

    const config = {
      paymentServiceUrl,
      appId
    };

    return config;
  }

  /**
   * Navigate to external URL
   */
  navigateTo(url: string): void {
    if (!this.isBrowser()) {
      throw new Error('Cannot navigate in non-browser environment');
    }

    window.location.href = url;
  }
}
