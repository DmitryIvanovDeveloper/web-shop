import { Container } from 'inversify';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { ProductRepository } from '../repositories/product.repository';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { ProductListPresenter } from '../../interface-adapters/presenters/product-list.presenter';
import { SHOP_TYPES } from './types';

export function bindShop(container: Container): void {
  container.bind<ProductRepositoryPort>(SHOP_TYPES.ProductRepository).to(ProductRepository).inSingletonScope();
  container.bind<GetProductsUseCase>(SHOP_TYPES.GetProductsUseCase).to(GetProductsUseCase);
  container.bind<ProductListPresenter>(SHOP_TYPES.ProductListPresenter).to(ProductListPresenter);
}
