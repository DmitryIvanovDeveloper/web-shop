/**
 * Port for accessing application context information
 * Provides access to app-specific configuration like appId, merchantId, etc.
 */
export interface AppContextPort {
  /**
   * Gets the current application ID
   * @throws Error if appId is not available
   */
  getAppId(): string;

  /**
   * Gets the current merchant ID if available
   */
  getMerchantId(): string | null;
}
