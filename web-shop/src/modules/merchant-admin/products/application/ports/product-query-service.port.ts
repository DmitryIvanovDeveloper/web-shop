import type { Result } from '../../../../../shared/domain/result/result';
import type { Product } from '../../domain/entities/product.entity';

export interface ProductQueryServicePort {
  loadById(id: string, appId: string): Promise<Result<Product, Error>>;
  loadAll(appId: string): Promise<Result<readonly Product[], Error>>;
}

