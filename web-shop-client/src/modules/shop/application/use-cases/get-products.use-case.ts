import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/domain/result/result';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { SHOP_TYPES } from '../../infrastructure/bootstrap/types';
import { Product } from '../../domain/entities/product.entity';
import { GetProductsRequest } from '../../domain/types';
import { ShopError } from '../../domain/errors/shop.error';

@injectable()
export class GetProductsUseCase {
  constructor(
    @inject(SHOP_TYPES.ProductRepository) 
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(request: GetProductsRequest): Promise<Result<Product[], ShopError>> {
    try {
      const result = await this.productRepository.getProducts(request);
      
      if (result.isFailure()) {
        return Result.error(result.error);
      }
      
      return Result.ok(result.data);
    } catch (error) {
      return Result.error(
        new ShopError(`Failed to get products: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
}
