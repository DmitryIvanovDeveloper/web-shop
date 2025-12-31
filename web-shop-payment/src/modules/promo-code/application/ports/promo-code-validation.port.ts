import { Result } from '../../../../shared/result/result';
import { ValidatedPromoCode, AppliedDiscount } from '../../domain/entities/validated-promo-code.entity';
import { PromoCodeError } from '../../domain/errors/promo-code.error';

/**
 * Promo Code Validation Port
 * 
 * Interface for validating promo codes
 * Abstracts the validation logic from business logic
 */
export interface PromoCodeValidationPort {
  /**
   * Validate a promo code for an order
   * 
   * @param code - The promo code to validate
   * @param appId - Application ID
   * @param userId - User ID (optional)
   * @param orderAmount - Original order amount
   * @param currency - Order currency
   * @returns Result with AppliedDiscount if valid, or PromoCodeError if invalid
   */
  validate(
    code: string,
    appId: string,
    userId: string | undefined,
    orderAmount: number,
    currency: string
  ): Promise<Result<AppliedDiscount, PromoCodeError>>;
}
















