import { Result } from '../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';
import {
  ProductNotFoundError,
  InvalidProductError,
  ProductValidationError,
} from '../errors/product.error';

export interface ProductProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly appid?: string | null;
  readonly main_image?: string | null;
  readonly background_image?: string | null;
  readonly rarity?: string | null;
  readonly discount?: string | null;
  readonly player_limit?: string | null;
  readonly limited_offer?: number | null;
  readonly expires_at?: string | null;
  readonly price?: number | null;
  readonly rp_bonus?: number | null;
  readonly lp_bonus?: number | null;
  readonly created_at?: string | null;
  readonly updated_at?: string | null;
}

export class Product {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly appid: string | null,
    public readonly main_image: string | null,
    public readonly background_image: string | null,
    public readonly rarity: string | null,
    public readonly discount: string | null,
    public readonly player_limit: string | null,
    public readonly limited_offer: number | null,
    public readonly expires_at: string | null,
    public readonly price: number | null,
    public readonly rp_bonus: number | null,
    public readonly lp_bonus: number | null,
    public readonly created_at: string | null,
    public readonly updated_at: string | null
  ) {}

  public static create(
    props: ProductProps
  ): Result<Product, InvalidArgumentError | ProductValidationError> {
    
    if (!props.title || props.title.trim().length === 0) {
      return Result.error(
        new ProductValidationError('Product title is required and cannot be empty')
      );
    }

    if (props.price !== null && props.price !== undefined && props.price < 0) {
      return Result.error(
        new ProductValidationError('Product price must be non-negative')
      );
    }

    if (props.rp_bonus !== null && props.rp_bonus !== undefined && props.rp_bonus < 0) {
      return Result.error(
        new ProductValidationError('Product rp_bonus must be non-negative')
      );
    }

    if (props.lp_bonus !== null && props.lp_bonus !== undefined && props.lp_bonus < 0) {
      return Result.error(
        new ProductValidationError('Product lp_bonus must be non-negative')
      );
    }

    if (props.limited_offer !== null && props.limited_offer !== undefined && props.limited_offer < 0) {
      return Result.error(
        new ProductValidationError('Product limited_offer must be non-negative')
      );
    }

    return Result.ok(
      new Product(
        props.id,
        props.title.trim(),
        props.description ?? null,
        props.appid ?? null,
        props.main_image ?? null,
        props.background_image ?? null,
        props.rarity ?? null,
        props.discount ?? null,
        props.player_limit ?? null,
        props.limited_offer ?? null,
        props.expires_at ?? null,
        props.price ?? null,
        props.rp_bonus ?? null,
        props.lp_bonus ?? null,
        props.created_at ?? null,
        props.updated_at ?? null
      )
    );
  }

  public withTitle(title: string): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      title,
    });
  }

  public withDescription(description: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      description,
    });
  }

  public withAppId(appid: string): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      appid,
    });
  }

  public withMainImage(main_image: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      main_image,
    });
  }

  public withBackgroundImage(background_image: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      background_image,
    });
  }

  public withRarity(rarity: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      rarity,
    });
  }

  public withDiscount(discount: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      discount,
    });
  }

  public withPlayerLimit(player_limit: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      player_limit,
    });
  }

  public withExpiresAt(expires_at: string | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      expires_at,
    });
  }

  public withPrice(price: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      price,
    });
  }

  public withRpBonus(rp_bonus: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      rp_bonus,
    });
  }

  public withLpBonus(lp_bonus: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      lp_bonus,
    });
  }

  public withLimitedOffer(limited_offer: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      limited_offer,
    });
  }

  public toProps(): ProductProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      appid: this.appid,
      main_image: this.main_image,
      background_image: this.background_image,
      rarity: this.rarity,
      discount: this.discount,
      player_limit: this.player_limit,
      limited_offer: this.limited_offer,
      expires_at: this.expires_at,
      price: this.price,
      rp_bonus: this.rp_bonus,
      lp_bonus: this.lp_bonus,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

