import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { GetPurchasedProductsUseCase } from '../../application/use-cases/get-purchased-products.use-case';
import { ProductsListViewModel } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';
import type { Product } from '../../domain/types';

@injectable()
export class ProductsListPresenter {
  private _viewModel: ProductsListViewModel = {
    status: 'loading',
    products: [],
    message: 'Loading products...'
  };
  
  private _onViewModelChanged?: () => void;
  private _cachedProducts: Product[] | null = null;

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

  public setOnViewModelChanged(callback: () => void): void {
    this._onViewModelChanged = callback;
  }

  public getViewModel(): ProductsListViewModel {
    return this._viewModel;
  }

  private updateViewModel(viewModel: ProductsListViewModel): void {
    this._viewModel = viewModel;
    if (this._onViewModelChanged) {
      this._onViewModelChanged();
    }
  }

  public async refreshStyles(): Promise<void> {
    this._logger.info('[ProductsListPresenter] Refreshing product styles');

    if (this._viewModel.status !== 'success') {
      this._logger.debug('[ProductsListPresenter] View model not in success state, skip style refresh', {
        status: this._viewModel.status
      });
      return;
    }

    try {
      const buttonStyle = await this.productStyleService.getButtonStyle();

      const updatedProducts = this._viewModel.products.map(product => ({
        ...product,
        buyButton: {
          ...product.buyButton,
          style: {
            ...product.buyButton?.style,
            ...buttonStyle,
          },
        },
      }));

      this.updateViewModel({
        ...this._viewModel,
        products: updatedProducts,
      });

      this._logger.info('[ProductsListPresenter] Product styles refreshed');
      this._logger.info('[ProductsListPresenter] Product styles applied from app-config (browser log)');
    } catch (error) {
      this._logger.error('[ProductsListPresenter] Failed to refresh product styles', error);
    }
  }

  async present(options?: { userId?: string; appId?: string }): Promise<ProductsListViewModel> {
    const totalStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this._logger.info('[ProductsListPresenter] Presenting products list...', { options });
    
    try {
      // 1. Get current user context from options (passed from event)
      const userId = options?.userId || '';
      const appId = options?.appId || '';
      
      this._logger.info('[ProductsListPresenter] User context', { 
        userId: userId || 'not-authorized', 
        appId: appId || 'all-products'
      });
      
      // 2. Load products once and cache them (all products without limit)
      let products: Product[];
      if (!this._cachedProducts) {
        const productsStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this._logger.info('[ProductsListPresenter] No cached products, loading from use case...');
        // Reset products list (show loading state only on first load)
        this.updateViewModel({
          status: 'loading',
          products: [],
          message: 'Loading products...'
        });
        products = await this.loadProductsUseCase.execute({ appId });
        const productsEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this._cachedProducts = products;
        this._logger.info('[ProductsListPresenter] Products loaded from Supabase and cached', { 
          count: products.length, 
          appId,
          durationMs: Math.round(productsEnd - productsStart)
        });
      } else {
        this._logger.info('[ProductsListPresenter] Using cached products, skipping Supabase load', {
          count: this._cachedProducts.length
        });
        products = this._cachedProducts;
      }
      
      // 3. Load purchased product IDs (returns empty array if no userId)
      const purchasedStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const purchasedIds = await this.getPurchasedProductsUseCase.execute(userId, appId);
      const purchasedEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._logger.info('[ProductsListPresenter] Purchase check completed', { 
        userId: userId || 'not-authorized', 
        appId,
        count: purchasedIds.length,
        purchasedIds,
        durationMs: Math.round(purchasedEnd - purchasedStart)
      });
      
      // 4. Load button style (app-config overrides JSON)
      const styleStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const buttonStyle = await this.productStyleService.getButtonStyle();
      const styleEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._logger.info('[ProductsListPresenter] Button style loaded', {
        durationMs: Math.round(styleEnd - styleStart)
      });
      
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
      
      const successViewModel: ProductsListViewModel = {
        status: 'success',
        products: enrichedProducts,
        message: `Loaded ${enrichedProducts.length} products`
      };
      
      this.updateViewModel(successViewModel);
      const totalEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._logger.info('[ProductsListPresenter] Present pipeline completed', {
        totalDurationMs: Math.round(totalEnd - totalStart)
      });
      return successViewModel;
    } catch (error) {
      this._logger.error('[ProductsListPresenter] Failed to present products list', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      const errorViewModel: ProductsListViewModel = {
        status: 'error',
        products: [],
        message: error instanceof Error ? error.message : 'Failed to load products'
      };
      
      this.updateViewModel(errorViewModel);
      return errorViewModel;
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

}
