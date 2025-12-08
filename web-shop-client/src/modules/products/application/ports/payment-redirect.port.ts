/**
 * Payment Redirect Port
 * 
 * Interface for payment redirection operations
 * Abstracts payment service integration from business logic
 */
export interface PaymentRedirectPort {
  /**
   * Build payment URL with product and user data
   */
  buildPaymentUrl(request: PaymentRedirectRequest): string;

  /**
   * Redirect to payment service
   */
  redirectToPayment(paymentUrl: string): void;
}

/**
 * Payment redirect request
 */
export interface PaymentRedirectRequest {
  readonly productId: string;
  readonly userId: string;
  readonly appId: string;
}
