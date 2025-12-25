/**
 * Promo Code Domain Errors
 * 
 * Domain-specific errors for promo code operations
 */

export enum PromoCodeErrorCode {
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  CODE_INACTIVE = 'CODE_INACTIVE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  CODE_NOT_STARTED = 'CODE_NOT_STARTED',
  MAX_REDEMPTIONS_REACHED = 'MAX_REDEMPTIONS_REACHED',
  MAX_REDEMPTIONS_PER_USER_REACHED = 'MAX_REDEMPTIONS_PER_USER_REACHED',
  INVALID_DISCOUNT_VALUE = 'INVALID_DISCOUNT_VALUE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class PromoCodeError extends Error {
  constructor(
    message: string,
    public readonly code: PromoCodeErrorCode,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PromoCodeError';
  }

  static codeNotFound(code: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code "${code}" not found`,
      PromoCodeErrorCode.CODE_NOT_FOUND,
      { code }
    );
  }

  static codeInactive(code: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code "${code}" is not active`,
      PromoCodeErrorCode.CODE_INACTIVE,
      { code }
    );
  }

  static codeExpired(code: string, endAt?: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code "${code}" has expired`,
      PromoCodeErrorCode.CODE_EXPIRED,
      { code, endAt }
    );
  }

  static codeNotStarted(code: string, startAt?: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code "${code}" is not yet active`,
      PromoCodeErrorCode.CODE_NOT_STARTED,
      { code, startAt }
    );
  }

  static maxRedemptionsReached(code: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code "${code}" has reached maximum redemptions`,
      PromoCodeErrorCode.MAX_REDEMPTIONS_REACHED,
      { code }
    );
  }

  static maxRedemptionsPerUserReached(code: string): PromoCodeError {
    return new PromoCodeError(
      `You have reached the maximum usage limit for promo code "${code}"`,
      PromoCodeErrorCode.MAX_REDEMPTIONS_PER_USER_REACHED,
      { code }
    );
  }

  static invalidDiscountValue(discountValue: number, discountType: string): PromoCodeError {
    return new PromoCodeError(
      `Invalid discount value: ${discountValue} for type ${discountType}`,
      PromoCodeErrorCode.INVALID_DISCOUNT_VALUE,
      { discountValue, discountType }
    );
  }

  static validationFailed(reason: string): PromoCodeError {
    return new PromoCodeError(
      `Promo code validation failed: ${reason}`,
      PromoCodeErrorCode.VALIDATION_FAILED,
      { reason }
    );
  }

  static networkError(message: string): PromoCodeError {
    return new PromoCodeError(
      `Network error: ${message}`,
      PromoCodeErrorCode.NETWORK_ERROR,
      { message }
    );
  }
}











