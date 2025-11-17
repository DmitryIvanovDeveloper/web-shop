import { Container } from 'inversify';
import { PRODUCT_TYPES } from './products.types';
import { ProductApiRepository } from '../repositories/product-api.repository';
import {
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  LoadProductsUseCase,
} from '../../application/use-cases';
import { ProductsPresenter } from '../../interface-adapters/presenters/products.presenter';
import type { ProductQueryServicePort } from '../../application/ports/product-query-service.port';
import type { ProductCommandServicePort } from '../../application/ports/product-command-service.port';

export function bindMerchantAdminProducts(container: Container): void {
  container.bind(ProductApiRepository).toSelf().inSingletonScope();

  container
    .bind<ProductQueryServicePort>(PRODUCT_TYPES.ProductQueryService)
    .toService(ProductApiRepository);

  container
    .bind<ProductCommandServicePort>(PRODUCT_TYPES.ProductCommandService)
    .toService(ProductApiRepository);

  container
    .bind<CreateProductUseCase>(PRODUCT_TYPES.CreateProductUseCase)
    .to(CreateProductUseCase)
    .inSingletonScope();

  container
    .bind<UpdateProductUseCase>(PRODUCT_TYPES.UpdateProductUseCase)
    .to(UpdateProductUseCase)
    .inSingletonScope();

  container
    .bind<DeleteProductUseCase>(PRODUCT_TYPES.DeleteProductUseCase)
    .to(DeleteProductUseCase)
    .inSingletonScope();

  container
    .bind<LoadProductsUseCase>(PRODUCT_TYPES.LoadProductsUseCase)
    .to(LoadProductsUseCase)
    .inSingletonScope();

  container.bind(ProductsPresenter).toSelf().inSingletonScope();
  container.bind(PRODUCT_TYPES.ProductsPresenter).toService(ProductsPresenter);
}

