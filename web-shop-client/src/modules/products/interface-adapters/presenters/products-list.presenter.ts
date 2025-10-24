import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { GetPurchasedProductsUseCase } from '../../application/use-cases/get-purchased-products.use-case';
import { ProductsListViewModel } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';
import { getCurrentUserId } from '../../../../shared/utils/user-session';

@injectable()
export class ProductsListPresenter {
  constructor(
    @inject(PRODUCTS_TYPES.LoadProductsUseCase)
    private readonly loadProductsUseCase: LoadProductsUseCase,
    @inject(PRODUCTS_TYPES.SelectProductForPaymentUseCase)
    private readonly selectProductForPaymentUseCase: SelectProductForPaymentUseCase,
    @inject(PRODUCTS_TYPES.GetPurchasedProductsUseCase)
    private readonly getPurchasedProductsUseCase: GetPurchasedProductsUseCase,
    @inject(PRODUCTS_TYPES.ProductStyleService)
    private readonly productStyleService: ProductStyleService,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async present(): Promise<ProductsListViewModel> {
    this._logger.info('[ProductsListPresenter] Presenting products list...');
    
    try {
      // 1. Get current user ID and appId
      const userId = getCurrentUserId();
      const appId = this._getCurrentAppId();
      this._logger.info('[ProductsListPresenter] Current user context', { userId, appId });
      
      // 2. Load products from Supabase filtered by appId
      const products = await this.loadProductsUseCase.execute({ appId });
      this._logger.info('[ProductsListPresenter] Products loaded from Supabase', { count: products.length, appId });
      
      // 3. Load purchased product IDs (filtered by userId + appId)
      // This is optional - if it fails, we just assume no purchases
      let purchasedIds: string[] = [];
      try {
        purchasedIds = await this.getPurchasedProductsUseCase.execute(userId, appId);
        this._logger.info('[ProductsListPresenter] Purchased products loaded', { 
          userId, 
          appId,
          count: purchasedIds.length,
          purchasedIds 
        });
      } catch (error) {
        this._logger.warn('[ProductsListPresenter] Failed to load purchased products, continuing without purchase data', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          appId
        });
        // Continue with empty purchasedIds - all products will be shown as not purchased
      }
      
      // 4. Load button style from JSON
      const buttonStyle = await this.productStyleService.getButtonStyle();
      this._logger.info('[ProductsListPresenter] Button style loaded');
      
      // 5. Enrich products with isPurchased and buyButton
      const enrichedProducts = products.map(product => {
        const isPurchased = purchasedIds.includes(product.id.value);
        this._logger.info('[ProductsListPresenter] Product purchase check', {
          productId: product.id.value,
          productTitle: product.title,
          isPurchased,
          purchasedIds
        });
        
        return {
          ...product,
          isPurchased,
          // Убираем скидки и таймер для купленных продуктов
          discount: isPurchased ? undefined : product.discount,
          timer: isPurchased ? undefined : product.timer,
          buyButton: {
            enabled: !isPurchased,
            style: buttonStyle
          }
        };
      });
      
      this._logger.info('[ProductsListPresenter] Products enriched successfully', { 
        totalProducts: enrichedProducts.length,
        purchasedCount: enrichedProducts.filter(p => p.isPurchased).length
      });
      
      return {
        status: 'success',
        products: enrichedProducts,
        message: `Loaded ${enrichedProducts.length} products`
      };
    } catch (error) {
      this._logger.error('[ProductsListPresenter] Failed to present products list', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return {
        status: 'error',
        products: [],
        message: error instanceof Error ? error.message : 'Failed to load products'
      };
    }
  }

  /**
   * Handle product buy button click
   * Delegates to Use Case for business logic
   */
  async onBuyProduct(productId: string): Promise<void> {
    this._logger.info('[ProductsListPresenter] Product buy clicked', {
      productId
    });

    try {
      // Delegate to Use Case for business logic (only pass productId)
      await this.selectProductForPaymentUseCase.execute({
        productId
      });

      this._logger.info('[ProductsListPresenter] Product selection handled successfully', {
        productId
      });
    } catch (error) {
      this._logger.error('[ProductsListPresenter] Failed to handle product selection', {
        error: error instanceof Error ? error.message : 'Unknown error',
        productId
      });
      throw error;
    }
  }

  /**
   * Get current app ID from localStorage or environment
   */
  private _getCurrentAppId(): string {
    try {
      // Try to get from localStorage (set by authentication)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.appId) {
          return user.appId;
        }
      }
    } catch (error) {
      console.warn('[ProductsListPresenter] Failed to parse stored user:', error);
    }

    // Fallback to environment variable
    return process.env.NEXT_PUBLIC_APP_ID || 'web-shop-client';
  }
}

