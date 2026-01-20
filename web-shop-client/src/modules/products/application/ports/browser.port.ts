
export interface BrowserPort {
  
  isBrowser(): boolean;

  
  getCurrentUser(): Promise<CurrentUser | null>;

  
  getAppConfig(): AppConfig;

  
  navigateTo(url: string): void;
}


export interface CurrentUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}


export interface AppConfig {
  readonly paymentServiceUrl: string;
  readonly appId: string;
}
