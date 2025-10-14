import { Result } from '../../../../shared/domain/result/result';
import { Product } from '../../domain/entities/product.entity';
import { ShopError } from '../../domain/errors/shop.error';
import { GetProductsRequest } from '../../domain/types';

export interface ProductRepositoryPort {
  getProducts(request: GetProductsRequest): Promise<Result<Product[], ShopError>>;
  getProductById(id: string): Promise<Result<Product, ShopError>>;
}
