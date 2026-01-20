import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Product, ProductQueryServicePort } from '../ports/product-query-service.port';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';

export interface LoadProductsInput {
  readonly appId: string;
}

export interface LoadProductsOutput {
  readonly products: readonly Product[];
}

@injectable()
export class LoadProductsUseCase {
  public constructor(
    @inject(OFFER_TYPES.ProductQueryService)
    private readonly _productQueryService: ProductQueryServicePort
  ) {}

  public async execute(input: LoadProductsInput): Promise<Result<LoadProductsOutput, Error>> {
    const productsResult = await this._productQueryService.loadProducts(input.appId);
    if (productsResult.isFailure()) {
      return Result.error(productsResult.error!);
    }

    return Result.ok({
      products: productsResult.data ?? [],
    });
  }
}

