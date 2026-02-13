import { Container } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { ProductsTranslationsConfigHandler } from '../../interface-adapters/handlers/translations-config.handler';
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
import { ProductsLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { ProductsLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { UserAuthenticatedEvent } from '../../../authentication/domain/events';
import { AppConfigLoadedEvent } from '../../../../shared/events/app-config-events';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import type { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import type { BrowserPort } from '../../application/ports/browser.port';
import type { PaymentRedirectPort } from '../../application/ports/payment-redirect.port';
import { TYPES, ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { UIComponentRegistry } from '../../../../infrastructure/services/ui-renderer/component-registry.service';
import { ProductsList } from '../../interface-adapters/ui/components/products-list';
import { PRODUCTS_TYPES } from './types';

export function bindProducts(container: Container): void {
    container.bind<ProductRepositoryPort>(PRODUCTS_TYPES.ProductRepository)
    .to(ProductRepository).inSingletonScope();

  container.bind<PurchaseRepositoryPort>(PRODUCTS_TYPES.PurchaseRepository)
    .to(PurchasesHttpRepository).inSingletonScope();

    container.bind(PRODUCTS_TYPES.ProductStyleService)
    .to(ProductStyleService).inSingletonScope();

      
    container.bind<BrowserPort>(ROOT_TYPES.Browser)
    .to(BrowserService).inSingletonScope();

  container.bind<PaymentRedirectPort>(PRODUCTS_TYPES.PaymentRedirect)
    .to(PaymentRedirectService).inSingletonScope();
  
    container.bind(PRODUCTS_TYPES.LoadProductsUseCase).to(LoadProductsUseCase).inSingletonScope();
  container.bind(PRODUCTS_TYPES.SelectProductForPaymentUseCase).to(SelectProductForPaymentUseCase).inSingletonScope();
  container.bind(PRODUCTS_TYPES.GetPurchasedProductsUseCase).to(GetPurchasedProductsUseCase).inSingletonScope();

    container.bind(PRODUCTS_TYPES.ProductsListPresenter).to(ProductsListPresenter).inSingletonScope();

    container
    .bind<IAsyncEventHandler<UserAuthenticatedEvent>>(PRODUCTS_TYPES.ProductsUserAuthenticatedHandler)
    .to(ProductsUserAuthenticatedHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(PRODUCTS_TYPES.AppConfigLoadedEventHandler)
    .to(ProductsAppConfigLoadedHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(PRODUCTS_TYPES.LocalizationLoadedEventHandler)
    .to(ProductsLocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(PRODUCTS_TYPES.LocalizationChangedEventHandler)
    .to(ProductsLocalizationChangedEventHandler)
    .inTransientScope();

    const uiComponentRegistry = container.get<UIComponentRegistry>(TYPES.UIComponentRegistry);
  uiComponentRegistry.register('ProductsList', ProductsList);
}

