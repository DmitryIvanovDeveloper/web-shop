import { inject, injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

export interface LoadProductsRequest {
  appId?: string;
}

@injectable()
export class LoadProductsUseCase {
  private _cachedAllProducts: Product[] | null = null;

  public constructor(
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly _productRepository: ProductRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async execute(request: LoadProductsRequest): Promise<Product[]> {
    this._logger.info('[LoadProductsUseCase] Loading products', {
      appId: request.appId ?? 'all',
    });

    try {
      let products: Product[];

      if (!this._cachedAllProducts) {
        this._logger.info('[LoadProductsUseCase] No cache found, loading all products from repository');
        this._cachedAllProducts = await this._productRepository.getAll();
      } else {
        this._logger.info('[LoadProductsUseCase] Using cached products from previous load', {
          total: this._cachedAllProducts.length,
        });
      }

      products = this._cachedAllProducts;

      // If appId is empty - return all products (user is not authorized)
      if (!request.appId) {
        this._logger.info('[LoadProductsUseCase] No appId provided, returning all products', {
          total: products.length,
        });
        return products;
      }

      // Filter by appId
      const filteredProducts = products.filter(product => {
        const matches = product.appid === request.appId;
        return matches;
      });

      this._logger.info('[LoadProductsUseCase] Products loaded', {
        total: products.length,
        filtered: filteredProducts.length,
        filteredProductTitles: filteredProducts.map(p => p.title),
      });

      return filteredProducts;
    } catch (error) {
      this._logger.error('[LoadProductsUseCase] Failed to load products', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
