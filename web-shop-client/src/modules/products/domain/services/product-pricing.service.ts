import { Price } from '../value-objects/price.value-object';

/**
 * Product Pricing Domain Service
 * 
 * Encapsulates complex pricing business logic
 * Pure domain logic without external dependencies
 */
export class ProductPricingService {
  /**
   * Calculate discount amount based on percentage
   */
  static calculateDiscount(originalPrice: Price, discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100');
    }

    return originalPrice.calculateDiscount(discountPercent);
  }

  /**
   * Calculate bonus points for a purchase
   */
  static calculateBonusPoints(price: Price, bonusPercent: number): number {
    if (bonusPercent < 0) {
      throw new Error('Bonus percent cannot be negative');
    }

    return price.addBonus(bonusPercent);
  }

  /**
   * Check if price is within acceptable range
   */
  static isPriceValid(price: Price, minPrice: Price, maxPrice: Price): boolean {
    if (price.currency !== minPrice.currency || price.currency !== maxPrice.currency) {
      throw new Error('All prices must have the same currency');
    }

    return !price.isGreaterThan(maxPrice) && minPrice.isGreaterThan(price) === false;
  }

  /**
   * Calculate savings amount
   */
  static calculateSavings(originalPrice: Price, currentPrice: Price): Price {
    if (originalPrice.currency !== currentPrice.currency) {
      throw new Error('Prices must have the same currency');
    }

    if (currentPrice.isGreaterThan(originalPrice)) {
      throw new Error('Current price cannot be greater than original price');
    }

    const savingsAmount = originalPrice.amount - currentPrice.amount;
    return new Price(savingsAmount, originalPrice.currency);
  }

  /**
   * Calculate savings percentage
   */
  static calculateSavingsPercentage(originalPrice: Price, currentPrice: Price): number {
    if (originalPrice.currency !== currentPrice.currency) {
      throw new Error('Prices must have the same currency');
    }

    if (originalPrice.amount === 0) {
      throw new Error('Original price cannot be zero');
    }

    const savings = this.calculateSavings(originalPrice, currentPrice);
    return Math.round((savings.amount / originalPrice.amount) * 100);
  }

  /**
   * Apply tiered pricing
   */
  static applyTieredPricing(basePrice: Price, quantity: number, tiers: PricingTier[]): Price {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Sort tiers by minimum quantity (ascending)
    const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
    
    // Find applicable tier
    let applicableTier = sortedTiers[0]; // Default to first tier
    
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQuantity) {
        applicableTier = tier;
      } else {
        break;
      }
    }

    // Apply discount
    return this.calculateDiscount(basePrice, applicableTier.discountPercent);
  }

  /**
   * Validate pricing rules
   */
  static validatePricingRules(originalPrice: Price, currentPrice: Price, maxDiscountPercent: number): ValidationResult {
    const errors: string[] = [];

    // Check currency consistency
    if (originalPrice.currency !== currentPrice.currency) {
      errors.push('Original and current prices must have the same currency');
    }

    // Check if current price is not greater than original
    if (currentPrice.isGreaterThan(originalPrice)) {
      errors.push('Current price cannot be greater than original price');
    }

    // Check discount limits
    if (originalPrice.amount > 0) {
      const actualDiscountPercent = this.calculateSavingsPercentage(originalPrice, currentPrice);
      if (actualDiscountPercent > maxDiscountPercent) {
        errors.push(`Discount cannot exceed ${maxDiscountPercent}%`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Pricing tier for tiered pricing
 */
export interface PricingTier {
  readonly minQuantity: number;
  readonly discountPercent: number;
}

/**
 * Validation result for pricing rules
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}
