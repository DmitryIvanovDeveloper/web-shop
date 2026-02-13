import { Container } from 'inversify';
import { PRODUCT_TYPES } from './products.types';
import { ProductApiRepository } from '../repositories/product-api.repository';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { ProductsPresenter } from '../../interface-adapters/presenters/products.presenter';
import { ProductImageApiStorage } from '../storage/product-image-api.storage';
import type { ProductQueryServicePort } from '../../application/ports/product-query-service.port';
import type { ProductCommandServicePort } from '../../application/ports/product-command-service.port';
import type { ProductImageStoragePort } from '../../application/ports/product-image-storage.port';

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

  container
    .bind<ProductImageStoragePort>(PRODUCT_TYPES.ProductImageStorage)
    .to(ProductImageApiStorage)
    .inSingletonScope();

  container
    .bind<UploadProductImageUseCase>(PRODUCT_TYPES.UploadProductImageUseCase)
    .to(UploadProductImageUseCase)
    .inSingletonScope();

  container.bind(ProductsPresenter).toSelf().inSingletonScope();
  container.bind(PRODUCT_TYPES.ProductsPresenter).toService(ProductsPresenter);
}







