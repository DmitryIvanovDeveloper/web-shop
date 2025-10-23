/**
 * Create Payment Intent Use Case I/O Types
 */

export type CreatePaymentIntentRequest = {
  productId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentIntentResponse = {
  intentId: string;
  clientSecret: string;
  status: string;
};
