/**
 * Save Payment Transaction Use Case I/O Types
 */

export type SavePaymentTransactionRequest = {
  paymentIntentId: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: string;
};

export type SavePaymentTransactionResponse = {
  transactionId: string;
};
