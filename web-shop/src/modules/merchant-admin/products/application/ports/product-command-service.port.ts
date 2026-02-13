import { Result } from '@/shared/result/result';
import type { Product } from '../../domain/entities/product.entity';

export interface ProductCommandServicePort {
  create(product: Product): Promise<Result<Product, Error>>;
  update(product: Product): Promise<Result<Product, Error>>;
  delete(id: string, appId: string): Promise<Result<void, Error>>;
}






