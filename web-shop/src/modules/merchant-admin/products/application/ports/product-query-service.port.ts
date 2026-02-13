import type { Result } from '@/shared/result/result';
import type { Product } from '../../domain/entities/product.entity';

export interface ProductQueryServicePort {
  loadAll(appId: string): Promise<Result<readonly Product[], Error>>;
  loadById(id: string, appId: string): Promise<Result<Product, Error>>;
}






