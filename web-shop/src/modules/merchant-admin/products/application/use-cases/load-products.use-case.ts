import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Product } from '../../domain/entities/product.entity';
import type { ProductQueryServicePort } from '../ports/product-query-service.port';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';

export interface LoadProductsInput {
  readonly appId: string;
}

export interface LoadProductsOutput {
  readonly products: readonly Product[];
}

@injectable()
export class LoadProductsUseCase {
  public constructor(
    @inject(PRODUCT_TYPES.ProductQueryService)
    private readonly queryService: ProductQueryServicePort
  ) {}

  public async execute(
    input: LoadProductsInput
  ): Promise<Result<LoadProductsOutput, Error>> {
    // Load products via port
    const loadResult = await this.queryService.loadAll(input.appId);
    if (loadResult.isFailure()) {
      return Result.error(loadResult.error!);
    }

    return Result.ok({ products: loadResult.data ?? [] });
  }
}

