import { Container } from 'inversify';
import { PRODUCTS_TYPES } from './types';
import { ProductRepository } from '../repositories/product.repository';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { ProductsListPresenter } from '../../interface-adapters/presenters/products-list.presenter';

export function bindProducts(container: Container): void {
  // Repositories
  container.bind(PRODUCTS_TYPES.ProductRepository).to(ProductRepository).inSingletonScope();
  
  // Use Cases
  container.bind(PRODUCTS_TYPES.LoadProductsUseCase).to(LoadProductsUseCase).inSingletonScope();
  
  // Presenters
  container.bind(PRODUCTS_TYPES.ProductsListPresenter).to(ProductsListPresenter).inSingletonScope();
}
