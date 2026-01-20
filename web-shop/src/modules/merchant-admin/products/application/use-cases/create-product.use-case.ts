import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import { Product, type ProductProps } from '../../domain/entities/product.entity';
import type { ProductCommandServicePort } from '../ports/product-command-service.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';

export interface CreateProductInput {
  readonly title: string;
  readonly appid?: string | null;
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

export interface CreateProductOutput {
  readonly product: Product;
}

@injectable()
export class CreateProductUseCase {
  public constructor(
    @inject(PRODUCT_TYPES.ProductCommandService)
    private readonly commandService: ProductCommandServicePort
  ) {}

  public async execute(
    input: CreateProductInput
  ): Promise<Result<CreateProductOutput, Error>> {
    
    const id = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const productProps: ProductProps = {
      id,
      title: input.title,
      appid: input.appid ?? null,
      main_image: input.main_image ?? null,
      background_image: input.background_image ?? null,
      rarity: input.rarity ?? null,
      discount: input.discount ?? null,
      player_limit: input.player_limit ?? null,
      expires_at: input.expires_at ?? null,
      price: input.price ?? null,
      rp_bonus: input.rp_bonus ?? null,
      lp_bonus: input.lp_bonus ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const productResult = Product.create(productProps);
    if (productResult.isFailure()) {
      return Result.error(productResult.error!);
    }

    const saveResult = await this.commandService.create(productResult.data!);
    if (saveResult.isFailure()) {
      return Result.error(saveResult.error!);
    }

    return Result.ok({ product: saveResult.data! });
  }
}

