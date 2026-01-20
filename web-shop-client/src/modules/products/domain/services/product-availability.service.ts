import { ProductId } from '../value-objects/product-id.value-object';


export class ProductAvailabilityService {
  
  static isProductAvailable(
    isPurchased: boolean,
    playerLimit?: string,
    timer?: string
  ): AvailabilityResult {
    const errors: string[] = [];

        if (isPurchased) {
      errors.push('Product has already been purchased');
    }

        if (playerLimit && !this._isPlayerLimitValid(playerLimit)) {
      errors.push('Product is not available due to player limit restrictions');
    }

        if (timer && !this._isTimerValid(timer)) {
      errors.push('Product is not available due to time restrictions');
    }

    return {
      isAvailable: errors.length === 0,
      errors,
      restrictions: this._getRestrictions(playerLimit, timer)
    };
  }

  
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

  
  static isHighDemandProduct(playerLimit?: string): boolean {
    if (!playerLimit) return false;

    const limit = this._parsePlayerLimit(playerLimit);
    return limit !== null && limit <= 10;   }

  
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

  
  private static _isPlayerLimitValid(playerLimit: string): boolean {
    if (!playerLimit) return true;

        const cleanLimit = playerLimit.toLowerCase().trim();
    if (cleanLimit === 'unlimited' || cleanLimit === '∞') {
      return true;
    }

    const limit = parseInt(cleanLimit, 10);
    return !isNaN(limit) && limit > 0;
  }

  
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

  
  private static _parsePlayerLimit(playerLimit: string): number | null {
    if (!playerLimit) return null;

    const cleanLimit = playerLimit.toLowerCase().trim();
    if (cleanLimit === 'unlimited' || cleanLimit === '∞') {
      return null;     }

    const limit = parseInt(cleanLimit, 10);
    return isNaN(limit) ? null : limit;
  }

  
  private static _getRestrictions(playerLimit?: string, timer?: string): ProductRestrictions {
    return {
      hasPlayerLimit: !!playerLimit,
      hasTimeLimit: !!timer,
      playerLimit: this._parsePlayerLimit(playerLimit || ''),
      timeRemaining: timer ? this.calculateRemainingTime(timer) : null
    };
  }
}


export interface AvailabilityResult {
  readonly isAvailable: boolean;
  readonly errors: readonly string[];
  readonly restrictions: ProductRestrictions;
}


export interface TimeRemaining {
  readonly expired: boolean;
  readonly remainingMs: number;
  readonly remainingHours?: number;
  readonly remainingMinutes?: number;
  readonly remainingSeconds?: number;
}


export interface ProductRestrictions {
  readonly hasPlayerLimit: boolean;
  readonly hasTimeLimit: boolean;
  readonly playerLimit: number | null;
  readonly timeRemaining: TimeRemaining | null;
}
