import { injectable } from 'inversify';
import { BrowserPort, CurrentUser, AppConfig } from '../../application/ports/browser.port';


@injectable()
export class BrowserService implements BrowserPort {
  
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  
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

  
  getTempUserId(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('temp_user_id');
  }

  
  getAppConfig(): AppConfig {
    const paymentServiceUrl =
      process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3002';
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'web-shop-client';

    const config = {
      paymentServiceUrl,
      appId
    };

    return config;
  }

  
  navigateTo(url: string): void {
    if (!this.isBrowser()) {
      throw new Error('Cannot navigate in non-browser environment');
    }

    window.location.href = url;
  }
}
