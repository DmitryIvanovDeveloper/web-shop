import { injectable } from 'inversify';
import type { AppContextPort } from '../../application/ports/app-context.port';

/**
 * URL-based implementation of AppContextPort
 * Reads app context information from URL search parameters
 */
@injectable()
export class UrlAppContextService implements AppContextPort {
  getAppId(): string {
    if (typeof window === 'undefined') {
      throw new Error('App ID not available on server side. App ID must be provided via URL parameters.');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('appId');

    if (!appId) {
      throw new Error(
        'App ID is required. Please specify ?appId=YOUR_APP_ID in the URL. ' +
        'App ID should be obtained from project selection in merchant admin.'
      );
    }

    return appId;
  }

  getMerchantId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('merchantId');
  }
}
