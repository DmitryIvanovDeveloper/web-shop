import { inject, injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';

export interface LoadProductsRequest {
  appId?: string;
}

@injectable()
export class LoadProductsUseCase {
  constructor(
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(request: LoadProductsRequest): Promise<Product[]> {
    console.log('[LoadProductsUseCase] Loading products for appId:', request.appId || 'all');
    
    try {
      const products = await this.productRepository.getAll();
      
      // Если appId пустой - вернуть все продукты (пользователь не авторизован)
      if (!request.appId) {
        console.log('[LoadProductsUseCase] No appId provided, returning all products:', {
          total: products.length
        });
        return products;
      }
      
      // Фильтровать по appId
      const filteredProducts = products.filter(product => 
        product.appid === request.appId
      );
      
      console.log('[LoadProductsUseCase] Products loaded:', {
        total: products.length,
        filtered: filteredProducts.length,
        appId: request.appId
      });
      
      return filteredProducts;
    } catch (error) {
      console.error('[LoadProductsUseCase] Failed to load products:', error);
      throw error;
    }
  }
}
