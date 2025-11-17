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
  readonly appid?: string | null;
  readonly main_image?: string | null;
  readonly background_image?: string | null;
  readonly rarity?: string | null;
  readonly discount?: string | null;
  readonly player_limit?: string | null;
  readonly expires_at?: string | null;
  readonly original_price?: number | null;
  readonly current_price?: number | null;
  readonly rp_bonus?: number | null;
  readonly lp_bonus?: number | null;
  readonly created_at?: string | null;
  readonly updated_at?: string | null;
}

export class Product {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly appid: string | null,
    public readonly main_image: string | null,
    public readonly background_image: string | null,
    public readonly rarity: string | null,
    public readonly discount: string | null,
    public readonly player_limit: string | null,
    public readonly expires_at: string | null,
    public readonly original_price: number | null,
    public readonly current_price: number | null,
    public readonly rp_bonus: number | null,
    public readonly lp_bonus: number | null,
    public readonly created_at: string | null,
    public readonly updated_at: string | null
  ) {}

  public static create(
    props: ProductProps
  ): Result<Product, InvalidArgumentError | ProductValidationError> {
    // Validate required fields
    if (!props.title || props.title.trim().length === 0) {
      return Result.error(
        new ProductValidationError('Product title is required and cannot be empty')
      );
    }

    // Validate prices are non-negative if provided
    if (props.original_price !== null && props.original_price !== undefined && props.original_price < 0) {
      return Result.error(
        new ProductValidationError('Product original_price must be non-negative')
      );
    }

    if (props.current_price !== null && props.current_price !== undefined && props.current_price < 0) {
      return Result.error(
        new ProductValidationError('Product current_price must be non-negative')
      );
    }

    // Validate bonuses are non-negative if provided
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

    // Note: expires_at can be in the past (for expired products) - no validation needed

    return Result.ok(
      new Product(
        props.id,
        props.title.trim(),
        props.appid ?? null,
        props.main_image ?? null,
        props.background_image ?? null,
        props.rarity ?? null,
        props.discount ?? null,
        props.player_limit ?? null,
        props.expires_at ?? null,
        props.original_price ?? null,
        props.current_price ?? null,
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

  public withOriginalPrice(original_price: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      original_price,
    });
  }

  public withCurrentPrice(current_price: number | null): Result<Product, ProductValidationError> {
    return Product.create({
      ...this.toProps(),
      current_price,
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

  public toProps(): ProductProps {
    return {
      id: this.id,
      title: this.title,
      appid: this.appid,
      main_image: this.main_image,
      background_image: this.background_image,
      rarity: this.rarity,
      discount: this.discount,
      player_limit: this.player_limit,
      expires_at: this.expires_at,
      original_price: this.original_price,
      current_price: this.current_price,
      rp_bonus: this.rp_bonus,
      lp_bonus: this.lp_bonus,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

