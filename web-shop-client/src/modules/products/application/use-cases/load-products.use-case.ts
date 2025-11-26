import { inject, injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';

export interface LoadProductsRequest {
  appId?: string;
}

@injectable()
export class LoadProductsUseCase {
  private _cachedAllProducts: Product[] | null = null;

  constructor(
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(request: LoadProductsRequest): Promise<Product[]> {
    console.log('[LoadProductsUseCase] Loading products for appId:', request.appId || 'all');
    
    try {
      let products: Product[];

      if (!this._cachedAllProducts) {
        console.log('[LoadProductsUseCase] No cache found, loading all products from repository');
        this._cachedAllProducts = await this.productRepository.getAll();
      } else {
        console.log('[LoadProductsUseCase] Using cached products from previous load', {
          total: this._cachedAllProducts.length
        });
      }

      products = this._cachedAllProducts;
      
      // Если appId пустой - вернуть все продукты (пользователь не авторизован)
      if (!request.appId) {
        console.log('[LoadProductsUseCase] No appId provided, returning all products:', {
          total: products.length
        });
        return products;
      }
      
      // Фильтровать по appId
      const filteredProducts = products.filter(product => {
        const matches = product.appid === request.appId;
        if (!matches) {
          console.log('[LoadProductsUseCase] Product filtered out:', {
            productId: product.id.value,
            title: product.title,
            productAppId: product.appid,
            requestedAppId: request.appId
          });
        }
        return matches;
      });
      
      console.log('[LoadProductsUseCase] Products loaded:', {
        total: products.length,
        filtered: filteredProducts.length,
         filteredProductTitles: filteredProducts.map(p => p.title)
      });
      
      return filteredProducts;
    } catch (error) {
      console.error('[LoadProductsUseCase] Failed to load products:', error);
      throw error;
    }
  }
}
