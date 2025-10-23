import { PaymentElementsContext } from '../../ports/payment-service.port';

/**
 * Confirm Payment Use Case I/O Types
 */

export type ConfirmPaymentRequest = {
  paymentIntentId: string;
  productSnapshot: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
  userId: string;
  appId?: string; // APP123 from query params
  paymentContext: PaymentElementsContext;
};

export type ConfirmPaymentResponse = void;
