import { ProductId } from '../value-objects/product-id.value-object';
import { Price } from '../value-objects/price.value-object';
import { ProductPricingService } from '../services/product-pricing.service';
import { ProductAvailabilityService } from '../services/product-availability.service';

/**
 * Product Domain Entity
 * 
 * Encapsulates product business logic and invariants
 * Pure domain entity with no external dependencies
 */
export class ProductEntity {
  private readonly _id: ProductId;
  private readonly _title: string;
  private readonly _originalPrice?: Price;
  private readonly _currentPrice?: Price;
  private readonly _rarity?: string;
  private readonly _playerLimit?: string;
  private readonly _timer?: string;
  private readonly _isPurchased: boolean;
  private readonly _appid?: string;

  constructor(
    id: ProductId,
    title: string,
    originalPrice?: Price,
    currentPrice?: Price,
    rarity?: string,
    playerLimit?: string,
    timer?: string,
    isPurchased: boolean = false,
    appid?: string
  ) {
    this._id = id;
    this._title = title;
    this._originalPrice = originalPrice;
    this._currentPrice = currentPrice;
    this._rarity = rarity;
    this._playerLimit = playerLimit;
    this._timer = timer;
    this._isPurchased = isPurchased;
    this._appid = appid;

    this._validateInvariants();
  }

  get id(): ProductId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get originalPrice(): Price | undefined {
    return this._originalPrice;
  }

  get currentPrice(): Price | undefined {
    return this._currentPrice;
  }

  get rarity(): string | undefined {
    return this._rarity;
  }

  get playerLimit(): string | undefined {
    return this._playerLimit;
  }

  get timer(): string | undefined {
    return this._timer;
  }

  get isPurchased(): boolean {
    return this._isPurchased;
  }

  get appid(): string | undefined {
    return this._appid;
  }

  /**
   * Check if product is available for purchase
   */
  isAvailable(): boolean {
    const availability = ProductAvailabilityService.isProductAvailable(
      this._isPurchased,
      this._playerLimit,
      this._timer
    );
    return availability.isAvailable;
  }

  /**
   * Get availability message
   */
  getAvailabilityMessage(): string {
    return ProductAvailabilityService.getAvailabilityMessage(
      this._isPurchased,
      this._playerLimit,
      this._timer
    );
  }

  /**
   * Check if product is in high demand
   */
  isHighDemand(): boolean {
    return ProductAvailabilityService.isHighDemandProduct(this._playerLimit);
  }

  /**
   * Calculate savings amount
   */
  calculateSavings(): Price | null {
    if (!this._originalPrice || !this._currentPrice) {
      return null;
    }

    return ProductPricingService.calculateSavings(this._originalPrice, this._currentPrice);
  }

  /**
   * Calculate savings percentage
   */
  calculateSavingsPercentage(): number | null {
    if (!this._originalPrice || !this._currentPrice) {
      return null;
    }

    return ProductPricingService.calculateSavingsPercentage(this._originalPrice, this._currentPrice);
  }

  /**
   * Check if product has discount
   */
  hasDiscount(): boolean {
    if (!this._originalPrice || !this._currentPrice) {
      return false;
    }

    return this._currentPrice.amount < this._originalPrice.amount;
  }

  /**
   * Get formatted price for display
   */
  getFormattedPrice(): string {
    return this._currentPrice?.format() || this._originalPrice?.format() || 'Price not available';
  }

  /**
   * Get formatted original price for display
   */
  getFormattedOriginalPrice(): string {
    return this._originalPrice?.format() || 'Original price not available';
  }

  /**
   * Check if product is premium (based on rarity)
   */
  isPremium(): boolean {
    const premiumRarities = ['LEGENDARY', 'MYTHICAL', 'EPIC'];
    return this._rarity ? premiumRarities.some(rarity => 
      this._rarity!.toUpperCase().includes(rarity)
    ) : false;
  }

  /**
   * Check if product is time-limited
   */
  isTimeLimited(): boolean {
    return !!this._timer;
  }

  /**
   * Check if product has player limit
   */
  hasPlayerLimit(): boolean {
    return !!this._playerLimit && this._playerLimit.toLowerCase() !== 'unlimited';
  }

  /**
   * Get time remaining for time-limited products
   */
  getTimeRemaining(): import('../services/product-availability.service').TimeRemaining | null {
    return ProductAvailabilityService.calculateRemainingTime(this._timer || '');
  }

  /**
   * Create a new product with updated purchase status
   */
  markAsPurchased(): ProductEntity {
    if (this._isPurchased) {
      throw new Error('Product is already purchased');
    }

    return new ProductEntity(
      this._id,
      this._title,
      this._originalPrice,
      this._currentPrice,
      this._rarity,
      this._playerLimit,
      this._timer,
      true, // isPurchased = true
      this._appid
    );
  }

  /**
   * Create a new product with updated app ID
   */
  withAppId(appid: string): ProductEntity {
    return new ProductEntity(
      this._id,
      this._title,
      this._originalPrice,
      this._currentPrice,
      this._rarity,
      this._playerLimit,
      this._timer,
      this._isPurchased,
      appid
    );
  }

  /**
   * Validate business invariants
   */
  private _validateInvariants(): void {
    if (!this._title || this._title.trim() === '') {
      throw new Error('Product title is required');
    }

    if (this._title.length > 100) {
      throw new Error('Product title cannot exceed 100 characters');
    }

    // Validate pricing if both prices are provided
    if (this._originalPrice && this._currentPrice) {
      if (this._currentPrice.currency !== this._originalPrice.currency) {
        throw new Error('Original and current prices must have the same currency');
      }

      if (this._currentPrice.amount > this._originalPrice.amount) {
        throw new Error('Current price cannot be greater than original price');
      }
    }
  }

  /**
   * Convert to plain object (for serialization)
   */
  toPlainObject(): {
    id: string;
    title: string;
    originalPrice?: string;
    currentPrice?: string;
    rarity?: string;
    playerLimit?: string;
    timer?: string;
    isPurchased: boolean;
    appid?: string;
  } {
    return {
      id: this._id.value,
      title: this._title,
      originalPrice: this._originalPrice?.format(),
      currentPrice: this._currentPrice?.format(),
      rarity: this._rarity,
      playerLimit: this._playerLimit,
      timer: this._timer,
      isPurchased: this._isPurchased,
      appid: this._appid
    };
  }

  /**
   * Create from plain object (for deserialization)
   */
  static fromPlainObject(data: {
    id: string;
    title: string;
    originalPrice?: string;
    currentPrice?: string;
    rarity?: string;
    playerLimit?: string;
    timer?: string;
    isPurchased?: boolean;
    appid?: string;
  }): ProductEntity {
    const originalPrice = data.originalPrice ? Price.fromString(data.originalPrice) : undefined;
    const currentPrice = data.currentPrice ? Price.fromString(data.currentPrice) : undefined;

    return new ProductEntity(
      ProductId.fromString(data.id),
      data.title,
      originalPrice,
      currentPrice,
      data.rarity,
      data.playerLimit,
      data.timer,
      data.isPurchased || false,
      data.appid
    );
  }
}
