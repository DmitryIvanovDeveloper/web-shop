export type PromoCodeErrorCode =
  | 'CodeAlreadyExists'
  | 'InvalidDiscountValue'
  | 'InvalidDateRange'
  | 'Inactive'
  | 'Expired'
  | 'NotStartedYet'
  | 'RedemptionLimitReached'
  | 'PerUserLimitReached';

export class PromoCodeError extends Error {
  public readonly code: PromoCodeErrorCode;

  public constructor(code: PromoCodeErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'PromoCodeError';
  }
}








