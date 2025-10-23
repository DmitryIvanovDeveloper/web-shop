/**
 * Browser Port
 * 
 * Interface for browser-specific operations
 * Abstracts browser APIs from business logic
 */
export interface BrowserPort {
  /**
   * Check if running in browser environment
   */
  isBrowser(): boolean;

  /**
   * Get current user from storage
   */
  getCurrentUser(): Promise<CurrentUser | null>;

  /**
   * Get temporary user ID
   */
  getTempUserId(): string | null;

  /**
   * Get application configuration
   */
  getAppConfig(): AppConfig;

  /**
   * Navigate to external URL
   */
  navigateTo(url: string): void;
}

/**
 * Current user data
 */
export interface CurrentUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  readonly paymentServiceUrl: string;
  readonly appId: string;
}
