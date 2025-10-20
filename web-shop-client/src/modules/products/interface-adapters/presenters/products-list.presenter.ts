import { inject, injectable } from 'inversify';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { ProductsListViewModel } from '../view-models/products-list.view-model';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class ProductsListPresenter {
  constructor(
    @inject(PRODUCTS_TYPES.LoadProductsUseCase)
    private readonly loadProductsUseCase: LoadProductsUseCase
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
}
