import { injectable, inject } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import type { ProductStoragePort } from '../../application/ports/product-storage.port';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @inject(PRODUCTS_TYPES.ProductStorage)
    private readonly _storage: ProductStoragePort
  ) {}

  async getAll(): Promise<Product[]> {
    return await this._storage.getAll();
  }

  async getById(id: string): Promise<Product | null> {
    return await this._storage.getById(id);
  }
}
