/**
 * Payment Domain Errors
 * 
 * All error messages in English (as per CODING_STANDARDS.md)
 * Error codes for programmatic error handling
 */

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: PaymentErrorCode,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export enum PaymentErrorCode {
  // Payment Intent Creation
  PAYMENT_INTENT_CREATION_FAILED = 'PAYMENT_INTENT_CREATION_FAILED',
  INVALID_PAYMENT_AMOUNT = 'INVALID_PAYMENT_AMOUNT',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  
  // Payment Confirmation
  PAYMENT_CONFIRMATION_FAILED = 'PAYMENT_CONFIRMATION_FAILED',
  INVALID_PAYMENT_CONTEXT = 'INVALID_PAYMENT_CONTEXT',
  
  // Payment Storage
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  TRANSACTION_SAVE_FAILED = 'TRANSACTION_SAVE_FAILED',
  PAYMENT_ALREADY_EXISTS = 'PAYMENT_ALREADY_EXISTS',
  
  // Validation
  INVALID_PAYMENT_ID = 'INVALID_PAYMENT_ID',
  INVALID_USER_ID = 'INVALID_USER_ID',
  INVALID_PRODUCT_ID = 'INVALID_PRODUCT_ID',
  
  // External Service Errors
  PAYMENT_PROVIDER_ERROR = 'PAYMENT_PROVIDER_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR'
}

/**
 * Specific Payment Error Classes
 */
export class PaymentNotFoundError extends PaymentError {
  constructor(paymentId: string) {
    super(
      `Payment with id "${paymentId}" not found`,
      PaymentErrorCode.PAYMENT_NOT_FOUND
    );
  }
}

export class InvalidPaymentAmountError extends PaymentError {
  constructor(amount: number) {
    super(
      `Invalid payment amount: ${amount}. Amount must be greater than zero`,
      PaymentErrorCode.INVALID_PAYMENT_AMOUNT
    );
  }
}

export class InvalidCurrencyError extends PaymentError {
  constructor(currency: string) {
    super(
      `Invalid currency: ${currency}. Supported currencies: USD, EUR, GBP`,
      PaymentErrorCode.INVALID_CURRENCY
    );
  }
}

export class PaymentIntentCreationError extends PaymentError {
  constructor(originalError?: Error) {
    super(
      'Failed to create payment intent',
      PaymentErrorCode.PAYMENT_INTENT_CREATION_FAILED,
      originalError
    );
  }
}

export class PaymentConfirmationError extends PaymentError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      PaymentErrorCode.PAYMENT_CONFIRMATION_FAILED,
      originalError
    );
  }
}

export class TransactionSaveError extends PaymentError {
  constructor(originalError?: Error) {
    super(
      'Failed to save payment transaction',
      PaymentErrorCode.TRANSACTION_SAVE_FAILED,
      originalError
    );
  }
}
