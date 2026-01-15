import { inject, injectable } from 'inversify';
import type { Product } from '../../domain/types';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import type { PurchaseRepositoryPort } from '../ports/purchase-repository.port';
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
    @inject(PRODUCTS_TYPES.PurchaseRepository)
    private readonly _purchaseRepository: PurchaseRepositoryPort,
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
        const hasProductsWithoutPrice = this._cachedAllProducts.some(
          (product) => !product.price
        );

        if (hasProductsWithoutPrice) {
          this._logger.warn(
            '[LoadProductsUseCase] Cached products missing price information, reloading from repository'
          );
          this._cachedAllProducts = await this._productRepository.getAll();
        } else {
          this._logger.info('[LoadProductsUseCase] Using cached products from previous load', {
            total: this._cachedAllProducts.length,
          });
        }
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

      // Calculate limitedOffer for products that have player_limit
      const productsWithLimits = filteredProducts.filter(p => p.playerLimit && p.playerLimit > 0);
      if (productsWithLimits.length > 0 && request.appId) {
        try {
          const purchaseCounts = await this._purchaseRepository.getProductPurchaseCounts(request.appId);

          // Calculate limitedOffer for each filtered product
          const enrichedProducts = filteredProducts.map(product => {
            if (product.playerLimit && product.playerLimit > 0) {
              const purchasedCount = purchaseCounts.get(product.id.value) || 0;
              const limitedOffer = Math.max(0, product.playerLimit - purchasedCount);

              this._logger.info('[LoadProductsUseCase] Calculated limitedOffer', {
                productId: product.id.value,
                productTitle: product.title,
                playerLimit: product.playerLimit,
                purchasedCount,
                limitedOffer: limitedOffer > 0 ? limitedOffer : undefined
              });

              // Return new product object with calculated limitedOffer
              return {
                ...product,
                limitedOffer: limitedOffer > 0 ? limitedOffer : undefined
              };
            }
            return product;
          });

          this._logger.info('[LoadProductsUseCase] Products loaded with limitedOffer calculation', {
            total: products.length,
            filtered: enrichedProducts.length,
            withLimits: productsWithLimits.length,
            filteredProductTitles: enrichedProducts.map(p => p.title),
          });

          return enrichedProducts;
        } catch (error) {
          this._logger.error('[LoadProductsUseCase] Failed to calculate limitedOffer, returning products without it', {
            error: error instanceof Error ? error.message : 'Unknown error',
            productsWithLimits: productsWithLimits.length
          });
          // Continue without limitedOffer calculation
        }
      }

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
