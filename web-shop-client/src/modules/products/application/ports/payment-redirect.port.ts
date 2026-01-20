
export interface PaymentRedirectPort {
  
  buildPaymentUrl(request: PaymentRedirectRequest): string;

  
  redirectToPayment(paymentUrl: string): void;
}


export interface PaymentRedirectRequest {
  readonly productId: string;
  readonly userId: string;
  readonly appId: string;
}
