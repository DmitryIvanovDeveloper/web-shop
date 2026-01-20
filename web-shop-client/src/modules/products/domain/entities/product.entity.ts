import { ProductId } from '../value-objects/product-id.value-object';
import { Price } from '../value-objects/price.value-object';
import { ProductPricingService } from '../services/product-pricing.service';
import { ProductAvailabilityService } from '../services/product-availability.service';


export class ProductEntity {
  private readonly _id: ProductId;
  private readonly _title: string;
  private readonly _price?: Price;
  private readonly _rarity?: string;
  private readonly _playerLimit?: string;
  private readonly _timer?: string;
  private readonly _isPurchased: boolean;
  private readonly _appid?: string;

  constructor(
    id: ProductId,
    title: string,
    price?: Price,
    rarity?: string,
    playerLimit?: string,
    timer?: string,
    isPurchased: boolean = false,
    appid?: string
  ) {
    this._id = id;
    this._title = title;
    this._price = price;
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

  get price(): Price | undefined {
    return this._price;
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

  
  isAvailable(): boolean {
    const availability = ProductAvailabilityService.isProductAvailable(
      this._isPurchased,
      this._playerLimit,
      this._timer
    );
    return availability.isAvailable;
  }

  
  getAvailabilityMessage(): string {
    return ProductAvailabilityService.getAvailabilityMessage(
      this._isPurchased,
      this._playerLimit,
      this._timer
    );
  }

  
  isHighDemand(): boolean {
    return ProductAvailabilityService.isHighDemandProduct(this._playerLimit);
  }

  
  getFormattedPrice(): string {
    return this._price?.format() || 'Price not available';
  }

  
  isPremium(): boolean {
    const premiumRarities = ['LEGENDARY', 'MYTHICAL', 'EPIC'];
    return this._rarity ? premiumRarities.some(rarity => 
      this._rarity!.toUpperCase().includes(rarity)
    ) : false;
  }

  
  isTimeLimited(): boolean {
    return !!this._timer;
  }

  
  hasPlayerLimit(): boolean {
    return !!this._playerLimit && this._playerLimit.toLowerCase() !== 'unlimited';
  }

  
  getTimeRemaining(): import('../services/product-availability.service').TimeRemaining | null {
    return ProductAvailabilityService.calculateRemainingTime(this._timer || '');
  }

  
  markAsPurchased(): ProductEntity {
    if (this._isPurchased) {
      throw new Error('Product is already purchased');
    }

    return new ProductEntity(
      this._id,
      this._title,
      this._price,
      this._rarity,
      this._playerLimit,
      this._timer,
      true,       this._appid
    );
  }

  
  withAppId(appid: string): ProductEntity {
    return new ProductEntity(
      this._id,
      this._title,
      this._price,
      this._rarity,
      this._playerLimit,
      this._timer,
      this._isPurchased,
      appid
    );
  }

  
  private _validateInvariants(): void {
    if (!this._title || this._title.trim() === '') {
      throw new Error('Product title is required');
    }

    if (this._title.length > 100) {
      throw new Error('Product title cannot exceed 100 characters');
    }

      }

  
  toPlainObject(): {
    id: string;
    title: string;
    price?: string;
    rarity?: string;
    playerLimit?: string;
    timer?: string;
    isPurchased: boolean;
    appid?: string;
  } {
    return {
      id: this._id.value,
      title: this._title,
      price: this._price?.format(),
      rarity: this._rarity,
      playerLimit: this._playerLimit,
      timer: this._timer,
      isPurchased: this._isPurchased,
      appid: this._appid
    };
  }

  
  static fromPlainObject(data: {
    id: string;
    title: string;
    price?: string;
    rarity?: string;
    playerLimit?: string;
    timer?: string;
    isPurchased?: boolean;
    appid?: string;
  }): ProductEntity {
    const price = data.price ? Price.fromString(data.price) : undefined;

    return new ProductEntity(
      ProductId.fromString(data.id),
      data.title,
      price,
      data.rarity,
      data.playerLimit,
      data.timer,
      data.isPurchased || false,
      data.appid
    );
  }
}
