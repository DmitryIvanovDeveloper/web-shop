/**
 * Payment Domain Entity
 * 
 * Represents a payment transaction in the domain layer
 * Contains business rules and validation for payment operations
 */

export interface Payment {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerIntentId: string; // Generic: not tied to specific payment provider
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Payment Value Object for amount validation
 */
export class PaymentAmount {
  private constructor(private readonly _value: number) {
    if (_value <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (_value > 999999.99) {
      throw new Error('Payment amount exceeds maximum limit');
    }
  }

  public static create(amount: number): PaymentAmount {
    return new PaymentAmount(amount);
  }

  public get value(): number {
    return this._value;
  }

  public toCents(): number {
    return Math.round(this._value * 100);
  }

  public equals(other: PaymentAmount): boolean {
    return this._value === other._value;
  }
}

/**
 * Payment Value Object for currency validation
 */
export class PaymentCurrency {
  private static readonly SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;

  private constructor(private readonly _value: string) {
    if (!PaymentCurrency.SUPPORTED_CURRENCIES.includes(_value as any)) {
      throw new Error(`Unsupported currency: ${_value}`);
    }
  }

  public static create(currency: string): PaymentCurrency {
    return new PaymentCurrency(currency.toUpperCase());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: PaymentCurrency): boolean {
    return this._value === other._value;
  }
}
