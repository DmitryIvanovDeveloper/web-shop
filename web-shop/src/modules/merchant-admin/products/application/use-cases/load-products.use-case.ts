

import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { Product } from '../../domain/entities/product.entity';
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
    const loadResult = await this.queryService.loadAll(input.appId);
    
    if (loadResult.isFailure) {
      return Result.error(loadResult.error!);
    }

    return Result.ok({ products: loadResult.value! });
  }
}







