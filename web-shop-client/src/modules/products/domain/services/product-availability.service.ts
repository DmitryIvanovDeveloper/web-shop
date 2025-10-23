import { ProductId } from '../value-objects/product-id.value-object';

/**
 * Product Availability Domain Service
 * 
 * Encapsulates business logic for product availability
 * Pure domain logic without external dependencies
 */
export class ProductAvailabilityService {
  /**
   * Check if product is available for purchase
   */
  static isProductAvailable(
    isPurchased: boolean,
    playerLimit?: string,
    timer?: string
  ): AvailabilityResult {
    const errors: string[] = [];

    // Check if already purchased
    if (isPurchased) {
      errors.push('Product has already been purchased');
    }

    // Check player limit
    if (playerLimit && !this._isPlayerLimitValid(playerLimit)) {
      errors.push('Product is not available due to player limit restrictions');
    }

    // Check timer availability
    if (timer && !this._isTimerValid(timer)) {
      errors.push('Product is not available due to time restrictions');
    }

    return {
      isAvailable: errors.length === 0,
      errors,
      restrictions: this._getRestrictions(playerLimit, timer)
    };
  }

  /**
   * Calculate remaining time for time-limited products
   */
  static calculateRemainingTime(timer: string): TimeRemaining | null {
    if (!timer) return null;

    try {
      const endTime = new Date(timer);
      const now = new Date();
      const remaining = endTime.getTime() - now.getTime();

      if (remaining <= 0) {
        return { expired: true, remainingMs: 0 };
      }

      return {
        expired: false,
        remainingMs: remaining,
        remainingHours: Math.floor(remaining / (1000 * 60 * 60)),
        remainingMinutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        remainingSeconds: Math.floor((remaining % (1000 * 60)) / 1000)
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if product is in high demand
   */
  static isHighDemandProduct(playerLimit?: string): boolean {
    if (!playerLimit) return false;

    const limit = this._parsePlayerLimit(playerLimit);
    return limit !== null && limit <= 10; // High demand if 10 or fewer spots
  }

  /**
   * Get availability status message
   */
  static getAvailabilityMessage(
    isPurchased: boolean,
    playerLimit?: string,
    timer?: string
  ): string {
    if (isPurchased) {
      return 'Already purchased';
    }

    const availability = this.isProductAvailable(isPurchased, playerLimit, timer);
    
    if (!availability.isAvailable) {
      return availability.errors[0] || 'Not available';
    }

    if (this.isHighDemandProduct(playerLimit)) {
      return 'Limited availability - High demand';
    }

    if (timer) {
      const remaining = this.calculateRemainingTime(timer);
      if (remaining && !remaining.expired) {
        return `Available for ${remaining.remainingHours}h ${remaining.remainingMinutes}m`;
      }
    }

    return 'Available';
  }

  /**
   * Validate player limit format
   */
  private static _isPlayerLimitValid(playerLimit: string): boolean {
    if (!playerLimit) return true;

    // Check if it's a number or "unlimited"
    const cleanLimit = playerLimit.toLowerCase().trim();
    if (cleanLimit === 'unlimited' || cleanLimit === '∞') {
      return true;
    }

    const limit = parseInt(cleanLimit, 10);
    return !isNaN(limit) && limit > 0;
  }

  /**
   * Validate timer format
   */
  private static _isTimerValid(timer: string): boolean {
    if (!timer) return true;

    try {
      const endTime = new Date(timer);
      const now = new Date();
      return endTime.getTime() > now.getTime();
    } catch {
      return false;
    }
  }

  /**
   * Parse player limit to number
   */
  private static _parsePlayerLimit(playerLimit: string): number | null {
    if (!playerLimit) return null;

    const cleanLimit = playerLimit.toLowerCase().trim();
    if (cleanLimit === 'unlimited' || cleanLimit === '∞') {
      return null; // No limit
    }

    const limit = parseInt(cleanLimit, 10);
    return isNaN(limit) ? null : limit;
  }

  /**
   * Get current restrictions
   */
  private static _getRestrictions(playerLimit?: string, timer?: string): ProductRestrictions {
    return {
      hasPlayerLimit: !!playerLimit,
      hasTimeLimit: !!timer,
      playerLimit: this._parsePlayerLimit(playerLimit || ''),
      timeRemaining: timer ? this.calculateRemainingTime(timer) : null
    };
  }
}

/**
 * Availability check result
 */
export interface AvailabilityResult {
  readonly isAvailable: boolean;
  readonly errors: readonly string[];
  readonly restrictions: ProductRestrictions;
}

/**
 * Time remaining information
 */
export interface TimeRemaining {
  readonly expired: boolean;
  readonly remainingMs: number;
  readonly remainingHours?: number;
  readonly remainingMinutes?: number;
  readonly remainingSeconds?: number;
}

/**
 * Product restrictions
 */
export interface ProductRestrictions {
  readonly hasPlayerLimit: boolean;
  readonly hasTimeLimit: boolean;
  readonly playerLimit: number | null;
  readonly timeRemaining: TimeRemaining | null;
}
