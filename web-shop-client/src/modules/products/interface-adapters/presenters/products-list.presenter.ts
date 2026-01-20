import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { GetPurchasedProductsUseCase } from '../../application/use-cases/get-purchased-products.use-case';
import { ProductsListViewModel, ProductsLabels } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ProductStyleService } from '../../infrastructure/services/product-style.service';
import type { Product } from '../../domain/types';

@injectable()
export class ProductsListPresenter {
  private _labels: ProductsLabels = {
    buyButton: 'Buy Now',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    loadingProducts: 'Loading products...',
    errorLoadingProducts: 'Error loading products',
    productsTitle: 'Products'
  };

  private _viewModel: ProductsListViewModel = {
    status: 'loading',
    products: [],
    message: 'Loading products...',
    labels: this._labels
  };
  
  private _onViewModelChanged?: () => void;
  private _cachedProducts: Product[] | null = null;
  private _translations: Record<string, string> = {};
  private _languageCode: string = 'en';
  private _direction: 'ltr' | 'rtl' = 'ltr';

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

  
  public updateLabelsFromTranslations(translations: Record<string, string>): void {
    this._labels = {
      buyButton: translations['products.buyButton'] || 'Buy Now',
      addToCart: translations['products.addToCart'] || 'Add to Cart',
      outOfStock: translations['products.outOfStock'] || 'Out of Stock',
      loadingProducts: translations['products.loadingProducts'] || 'Loading products...',
      errorLoadingProducts: translations['products.errorLoadingProducts'] || 'Error loading products',
      productsTitle: translations['products.productsTitle'] || 'Products'
    };

        this.updateViewModel({
      ...this._viewModel,
      labels: this._labels
    });

    this._logger.info('[ProductsListPresenter] Labels updated from translations');
  }

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

  public onTranslationsConfig(
    translations: Record<string, string>,
    languageCode: string,
    direction: 'ltr' | 'rtl'
  ): void {
    this._translations = translations;
    this._languageCode = languageCode;
    this._direction = direction;

    this._logger.info('[ProductsListPresenter] Translations config updated', {
      languageCode,
      direction,
      translationsCount: Object.keys(translations).length
    });
  }

  public getTranslation(key: string, fallback?: string): string {
    return this._translations[key] || fallback || key;
  }

  public getDirection(): 'ltr' | 'rtl' {
    return this._direction;
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
            const userId = options?.userId || '';
      const appId = options?.appId || '';
      
      this._logger.info('[ProductsListPresenter] User context', { 
        userId: userId || 'not-authorized', 
        appId: appId || 'all-products'
      });
      
            let products: Product[];
      if (!this._cachedProducts) {
        const productsStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this._logger.info('[ProductsListPresenter] No cached products, loading from use case...');
                this.updateViewModel({
          status: 'loading',
          products: [],
          message: 'Loading products...',
          labels: this._labels
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
      
            const styleStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const buttonStyle = await this.productStyleService.getButtonStyle();
      const styleEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._logger.info('[ProductsListPresenter] Button style loaded', {
        durationMs: Math.round(styleEnd - styleStart)
      });
      
            const enrichedProducts = products.map(product => {
        const isPurchased = purchasedIds.includes(product.id.value);
        
        return {
          ...product,
          isPurchased,
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
        message: `Loaded ${enrichedProducts.length} products`,
        labels: this._labels
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
        message: error instanceof Error ? error.message : 'Failed to load products',
        labels: this._labels
      };
      
      this.updateViewModel(errorViewModel);
      return errorViewModel;
    }
  }

  
  async onBuyProduct(productId: string): Promise<void> {
    this._logger.info('[ProductsListPresenter] Product buy clicked', {
      productId
    });

    try {
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
