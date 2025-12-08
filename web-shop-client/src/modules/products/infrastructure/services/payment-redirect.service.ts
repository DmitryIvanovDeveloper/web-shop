import { injectable, inject } from 'inversify';
import type { PaymentRedirectPort, PaymentRedirectRequest } from '../../application/ports/payment-redirect.port';
import type { BrowserPort } from '../../application/ports/browser.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Payment Redirect Service Implementation
 * 
 * Infrastructure implementation of PaymentRedirectPort
 * Handles payment service redirection through abstraction
 */
@injectable()
export class PaymentRedirectService implements PaymentRedirectPort {
  constructor(
    @inject(ROOT_TYPES.Browser)
    private readonly _browser: BrowserPort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  /**
   * Build payment URL with product and user data
   */
  buildPaymentUrl(request: PaymentRedirectRequest): string {
    const appConfig = this._browser.getAppConfig();
    const paymentUrl = new URL('/payment', appConfig.paymentServiceUrl);
    
    // Only pass minimal parameters
    paymentUrl.searchParams.set('productId', request.productId);
    paymentUrl.searchParams.set('userId', request.userId);
    paymentUrl.searchParams.set('appId', request.appId);
    
    this._logger.info('[PaymentRedirectService] Payment URL built', {
      productId: request.productId,
      userId: request.userId,
      appId: request.appId,
      paymentUrl: paymentUrl.toString()
    });
    
    return paymentUrl.toString();
  }

  /**
   * Redirect to payment service
   */
  redirectToPayment(paymentUrl: string): void {
    this._logger.info('[PaymentRedirectService] Redirecting to payment service', {
      paymentUrl
    });
    
    this._browser.navigateTo(paymentUrl);
  }
}
