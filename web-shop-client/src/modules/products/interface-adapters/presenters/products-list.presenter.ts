import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { ProductsListViewModel } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

@injectable()
export class ProductsListPresenter {
  constructor(
    @inject(PRODUCTS_TYPES.LoadProductsUseCase)
    private readonly loadProductsUseCase: LoadProductsUseCase,
    @inject(PRODUCTS_TYPES.SelectProductForPaymentUseCase)
    private readonly selectProductForPaymentUseCase: SelectProductForPaymentUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async present(): Promise<ProductsListViewModel> {
    console.log('[ProductsListPresenter] Presenting products list...');
    
    try {
      const products = await this.loadProductsUseCase.execute();
      console.log('[ProductsListPresenter] Products loaded successfully:', products.length);
      
      return {
        status: 'success',
        products,
        message: `Loaded ${products.length} products`
      };
    } catch (error) {
      console.error('[ProductsListPresenter] Failed to load products:', error);
      
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
}

