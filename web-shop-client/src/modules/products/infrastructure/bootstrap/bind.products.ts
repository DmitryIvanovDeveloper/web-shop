import { Container } from 'inversify';
import { PRODUCTS_TYPES } from './types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { ProductRepository } from '../repositories/product.repository';
import { PurchasesHttpRepository } from '../repositories/purchases-http.repository';
import { ProductStyleService } from '../services/product-style.service';
import { BrowserService } from '../services/browser.service';
import { PaymentRedirectService } from '../services/payment-redirect.service';
import { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import { SelectProductForPaymentUseCase } from '../../application/use-cases/select-product-for-payment.use-case';
import { GetPurchasedProductsUseCase } from '../../application/use-cases/get-purchased-products.use-case';
import { ProductsListPresenter } from '../../interface-adapters/presenters/products-list.presenter';
import { ProductsUserAuthenticatedHandler } from '../../interface-adapters/handlers/user-authenticated.handler';
import { ProductsAppConfigLoadedHandler } from '../../interface-adapters/handlers/app-config-loaded.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { UserAuthenticatedEvent } from '../../../../shared/events/auth-events';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import type { ProductStoragePort } from '../../application/ports/product-storage.port';
import type { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import type { BrowserPort } from '../../application/ports/browser.port';
import type { PaymentRedirectPort } from '../../application/ports/payment-redirect.port';

export function bindProducts(container: Container): void {
  // Repository Layer
  container.bind<ProductRepositoryPort>(PRODUCTS_TYPES.ProductRepository)
    .to(ProductRepository).inSingletonScope();

  container.bind<PurchaseRepositoryPort>(PRODUCTS_TYPES.PurchaseRepository)
    .to(PurchasesHttpRepository).inSingletonScope();

  // Services
  container.bind(PRODUCTS_TYPES.ProductStyleService)
    .to(ProductStyleService).inSingletonScope();

  // NOTE: AuthService НЕ регистрируется здесь!
  // Он регистрируется в Authentication модуле и доступен через shared Symbol
  // Products модуль использует его через PRODUCTS_TYPES.AuthService = Symbol.for('AuthService')

  // Browser and Payment Services
  container.bind<BrowserPort>(ROOT_TYPES.Browser)
    .to(BrowserService).inSingletonScope();

  container.bind<PaymentRedirectPort>(PRODUCTS_TYPES.PaymentRedirect)
    .to(PaymentRedirectService).inSingletonScope();
  
  // Use Cases
  container.bind(PRODUCTS_TYPES.LoadProductsUseCase).to(LoadProductsUseCase).inSingletonScope();
  container.bind(PRODUCTS_TYPES.SelectProductForPaymentUseCase).to(SelectProductForPaymentUseCase).inSingletonScope();
  container.bind(PRODUCTS_TYPES.GetPurchasedProductsUseCase).to(GetPurchasedProductsUseCase).inSingletonScope();

  // Presenters
  container.bind(PRODUCTS_TYPES.ProductsListPresenter).to(ProductsListPresenter).inSingletonScope();

  // Event Handlers (Interface Adapters) - автоматически подхватываются EventBus
  container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(PRODUCTS_TYPES.ProductsUserAuthenticatedHandler)
    .to(ProductsUserAuthenticatedHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>'))
    .to(ProductsAppConfigLoadedHandler)
    .inTransientScope();
}

