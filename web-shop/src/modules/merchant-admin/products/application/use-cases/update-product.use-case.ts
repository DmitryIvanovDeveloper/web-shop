import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import { Product } from '../../domain/entities/product.entity';
import type { ProductQueryServicePort } from '../ports/product-query-service.port';
import type { ProductCommandServicePort } from '../ports/product-command-service.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';

export interface UpdateProductInput {
  readonly id: string;
  readonly appId: string;
  readonly title?: string;
  readonly main_image?: string | null;
  readonly background_image?: string | null;
  readonly rarity?: string | null;
  readonly discount?: string | null;
  readonly player_limit?: string | null;
  readonly expires_at?: string | null;
  readonly price?: number | null;
  readonly rp_bonus?: number | null;
  readonly lp_bonus?: number | null;
}

export interface UpdateProductOutput {
  readonly product: Product;
}

@injectable()
export class UpdateProductUseCase {
  public constructor(
    @inject(PRODUCT_TYPES.ProductQueryService)
    private readonly queryService: ProductQueryServicePort,
    @inject(PRODUCT_TYPES.ProductCommandService)
    private readonly commandService: ProductCommandServicePort
  ) {}

  public async execute(
    input: UpdateProductInput
  ): Promise<Result<UpdateProductOutput, Error>> {
    // Load existing product via port
    const loadResult = await this.queryService.loadById(input.id, input.appId);
    if (loadResult.isFailure()) {
      return Result.error(loadResult.error!);
    }

    const existingProduct = loadResult.data!;

    // Create updated entity via Domain immutable update methods
    let updatedProduct = existingProduct;

    if (input.title !== undefined) {
      const titleResult = updatedProduct.withTitle(input.title);
      if (titleResult.isFailure()) {
        return Result.error(titleResult.error!);
      }
      updatedProduct = titleResult.data!;
    }

    if (input.main_image !== undefined) {
      const imageResult = updatedProduct.withMainImage(input.main_image);
      if (imageResult.isFailure()) {
        return Result.error(imageResult.error!);
      }
      updatedProduct = imageResult.data!;
    }

    if (input.background_image !== undefined) {
      const bgImageResult = updatedProduct.withBackgroundImage(input.background_image);
      if (bgImageResult.isFailure()) {
        return Result.error(bgImageResult.error!);
      }
      updatedProduct = bgImageResult.data!;
    }

    if (input.rarity !== undefined) {
      const rarityResult = updatedProduct.withRarity(input.rarity);
      if (rarityResult.isFailure()) {
        return Result.error(rarityResult.error!);
      }
      updatedProduct = rarityResult.data!;
    }

    if (input.discount !== undefined) {
      const discountResult = updatedProduct.withDiscount(input.discount);
      if (discountResult.isFailure()) {
        return Result.error(discountResult.error!);
      }
      updatedProduct = discountResult.data!;
    }

    if (input.player_limit !== undefined) {
      const limitResult = updatedProduct.withPlayerLimit(input.player_limit);
      if (limitResult.isFailure()) {
        return Result.error(limitResult.error!);
      }
      updatedProduct = limitResult.data!;
    }

    if (input.expires_at !== undefined) {
      const expiresResult = updatedProduct.withExpiresAt(input.expires_at);
      if (expiresResult.isFailure()) {
        return Result.error(expiresResult.error!);
      }
      updatedProduct = expiresResult.data!;
    }

    if (input.price !== undefined) {
      const priceResult = updatedProduct.withPrice(input.price);
      if (priceResult.isFailure()) {
        return Result.error(priceResult.error!);
      }
      updatedProduct = priceResult.data!;
    }

    if (input.rp_bonus !== undefined) {
      const rpBonusResult = updatedProduct.withRpBonus(input.rp_bonus);
      if (rpBonusResult.isFailure()) {
        return Result.error(rpBonusResult.error!);
      }
      updatedProduct = rpBonusResult.data!;
    }

    if (input.lp_bonus !== undefined) {
      const lpBonusResult = updatedProduct.withLpBonus(input.lp_bonus);
      if (lpBonusResult.isFailure()) {
        return Result.error(lpBonusResult.error!);
      }
      updatedProduct = lpBonusResult.data!;
    }

    // Update updated_at timestamp
    const finalProductResult = Product.create({
      ...updatedProduct.toProps(),
      updated_at: new Date().toISOString(),
    });
    if (finalProductResult.isFailure()) {
      return Result.error(finalProductResult.error!);
    }

    // Save via port
    const saveResult = await this.commandService.update(finalProductResult.data!);
    if (saveResult.isFailure()) {
      return Result.error(saveResult.error!);
    }

    return Result.ok({ product: saveResult.data! });
  }
}

