import { inject, injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadProductsUseCase {
  constructor(
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(): Promise<Product[]> {
    console.log('[LoadProductsUseCase] Loading all products...');
    
    try {
      const products = await this.productRepository.getAll();
      console.log('[LoadProductsUseCase] Products loaded:', products.length);
      return products;
    } catch (error) {
      console.error('[LoadProductsUseCase] Failed to load products:', error);
      throw error;
    }
  }
}
