/**
 * Validated Promo Code Entity
 * 
 * Domain entity representing a validated promo code that can be applied to an order
 * This is a value object that represents the result of promo code validation
 */

export interface ValidatedPromoCode {
  readonly id: string;
  readonly code: string;
  readonly discountType: 'percent' | 'fixed_amount';
  readonly discountValue: number;
  readonly currency: string | null;
  readonly isFreeShipping: boolean;
  readonly campaignId: string | null;
}

/**
 * Applied Discount
 * 
 * Represents the discount calculation result after applying a promo code
 */
export interface AppliedDiscount {
  readonly promoCode: ValidatedPromoCode;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly finalAmount: number;
  readonly currency: string;
}

/**
 * Create Applied Discount
 * 
 * Calculates the discount based on promo code type and order amount
 */
export function createAppliedDiscount(
  promoCode: ValidatedPromoCode,
  originalAmount: number,
  currency: string
): AppliedDiscount {
  let discountAmount = 0;

  if (promoCode.discountType === 'percent') {
    discountAmount = originalAmount * (promoCode.discountValue / 100);
  } else if (promoCode.discountType === 'fixed_amount') {
    discountAmount = promoCode.discountValue;
  }

  // Ensure discount doesn't exceed original amount
  discountAmount = Math.min(discountAmount, originalAmount);
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  return {
    promoCode,
    originalAmount,
    discountAmount,
    finalAmount,
    currency
  };
}

















