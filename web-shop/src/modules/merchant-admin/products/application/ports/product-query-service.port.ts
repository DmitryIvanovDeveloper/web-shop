import type { Result } from '../../../../../shared/domain/result/result';
import type { Product } from '../../domain/entities/product.entity';

/**
 * Application-layer port for product read operations.
 * Implemented in infrastructure (e.g. ProductApiRepository).
 */
export interface ProductQueryServicePort {
  loadAll(appId: string): Promise<Result<readonly Product[], Error>>;

  loadById(id: string, appId: string): Promise<Result<Product, Error>>;
}


