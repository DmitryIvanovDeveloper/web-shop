import { Result } from '../../../../shared/result/result';
import { PaymentError } from '../../domain/errors/payment.error';

/**
 * Payment Service Port
 * 
 * Generic payment provider interface (not tied to Stripe, PayPal, etc.)
 * Defines the contract for payment processing operations
 */
export interface PaymentServicePort {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<Result<PaymentIntentResult, PaymentError>>;
  confirmPayment(input: ConfirmPaymentInput): Promise<Result<void, PaymentError>>;
  getPaymentStatus(paymentIntentId: string): Promise<Result<PaymentStatusResult, PaymentError>>;
}

/**
 * Create Payment Intent Input
 */
export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  productId: string;
  metadata?: Record<string, string>;
}

/**
 * Payment Intent Result
 */
export interface PaymentIntentResult {
  intentId: string;
  clientSecret: string;
  status: string;
}

/**
 * Confirm Payment Input
 */
export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentContext: PaymentElementsContext;
}

/**
 * Payment Elements Context
 * 
 * Generic context for payment UI elements
 * Not tied to specific payment provider implementation
 */
export interface PaymentElementsContext {
  providerInstance: unknown; // The payment provider SDK instance
  elementsInstance: unknown; // The payment elements UI instance
}

/**
 * Payment Status Result
 */
export interface PaymentStatusResult {
  status: string;
  amount: number;
  currency: string;
  lastPaymentError?: string;
}
