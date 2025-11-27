import type { Result } from '../../../../../shared/domain/result/result';
import type { Product } from '../../domain/entities/product.entity';

/**
 * Application-layer port for product write operations.
 * Implemented in infrastructure (e.g. ProductApiRepository).
 */
export interface ProductCommandServicePort {
  create(product: Product): Promise<Result<Product, Error>>;

  update(product: Product): Promise<Result<Product, Error>>;

  delete(id: string, appId: string): Promise<Result<void, Error>>;
}


