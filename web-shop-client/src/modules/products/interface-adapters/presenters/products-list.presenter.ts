import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { GetPurchasedProductsUseCase } from '../../application/use-cases/get-purchased-products.use-case';
import { ProductsListViewModel } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';

@injectable()
export class ProductsListPresenter {
  private _viewModel: ProductsListViewModel = {
    status: 'loading',
    products: [],
    message: 'Loading products...'
  };
  
  private _onViewModelChanged?: () => void;

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
    this._logger.info('[ProductsListPresenter] Presenting products list...', { options });
    
    try {
      // 1. Reset products list (show loading state)
      this._logger.info('[ProductsListPresenter] Resetting products list');
      this.updateViewModel({
        status: 'loading',
        products: [],
        message: 'Loading products...'
      });
      
      // 2. Get current user context from options (passed from event)
      const userId = options?.userId || '';
      const appId = options?.appId || '';
      
      this._logger.info('[ProductsListPresenter] User context', { 
        userId: userId || 'not-authorized', 
        appId: appId || 'all-products'
      });
      
      // 3. Load products from Supabase filtered by appId
      const products = await this.loadProductsUseCase.execute({ appId });
      this._logger.info('[ProductsListPresenter] Products loaded from Supabase', { count: products.length, appId });
      
      // 4. Load purchased product IDs (returns empty array if no userId)
      const purchasedIds = await this.getPurchasedProductsUseCase.execute(userId, appId);
      this._logger.info('[ProductsListPresenter] Purchase check completed', { 
        userId: userId || 'not-authorized', 
        appId,
        count: purchasedIds.length,
        purchasedIds 
      });
      
      // 5. Load button style (app-config overrides JSON)
      const buttonStyle = await this.productStyleService.getButtonStyle();
      this._logger.info('[ProductsListPresenter] Button style loaded');
      
      // 6. Enrich products with isPurchased and buyButton
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

