import { injectable, inject } from 'inversify';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import type { BrowserPort } from '../ports/browser.port';
import type { PaymentRedirectPort } from '../ports/payment-redirect.port';
import type { AuthServicePort } from '../ports/auth-service.port';
import { ProductSelectedForPaymentEvent } from '../../../../shared/events/product-events';
import { AuthenticationRequiredEvent } from '../../../../shared/events/auth-events';
import {
  ProductPaymentService,
  type ProductPaymentSnapshot,
} from '../../domain/services/product-payment.service';
import { UnauthenticatedUserError } from '../../domain/errors/products.error';

export interface SelectProductForPaymentRequest {
  productId: string;
}

@injectable()
export class SelectProductForPaymentUseCase {
  public constructor(
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly _productRepository: ProductRepositoryPort,
    @inject(ROOT_TYPES.Browser)
    private readonly _browser: BrowserPort,
    @inject(PRODUCTS_TYPES.PaymentRedirect)
    private readonly _paymentRedirect: PaymentRedirectPort,
    @inject(PRODUCTS_TYPES.AuthService)
    private readonly _authService: AuthServicePort
  ) {}

  public async execute(request: SelectProductForPaymentRequest): Promise<void> {
    this._logger.info('[SelectProductForPaymentUseCase] Product selected for payment', {
      productId: request.productId
    });

    try {
      // 1. CHECK AUTHENTICATION (UseCase координирует бизнес-логику)
      if (!this._authService.isUserAuthenticated()) {
        this._logger.warn('[SelectProductForPaymentUseCase] User not authenticated', {
          productId: request.productId
        });
        
        // Публикуем событие для показа AuthPopup (межмодульное общение)
        await this._eventBus.publishAsync(
          new AuthenticationRequiredEvent('products', 'purchase', request.productId)
        );
        
        // Выбрасываем ошибку для остановки выполнения
        throw new UnauthenticatedUserError(request.productId);
      }

      // 2. Load product data from repository
      const product = await this._productRepository.getById(request.productId);
      
      if (!product) {
        throw new Error(`Product with id ${request.productId} not found`);
      }

      // 2. Validate product for payment using Domain Service
      const validation = ProductPaymentService.validateProductForPayment(product);
      if (!validation.isValid) {
        throw new Error(`Product validation failed: ${validation.errors.join(', ')}`);
      }

      // 3. Create product snapshot using Domain Service
      const productSnapshot = ProductPaymentService.createProductSnapshot(product);

      this._logger.info('[SelectProductForPaymentUseCase] Product data loaded and validated', {
        productId: request.productId,
        productTitle: productSnapshot.title,
        productPrice: productSnapshot.price
      });

      // 4. Handle payment redirection
      if (this._browser.isBrowser()) {
        await this._handleBrowserPayment(productSnapshot);
      } else {
        await this._handleServerPayment(request.productId, productSnapshot);
      }
    } catch (error) {
      if (error instanceof UnauthenticatedUserError) {
        // Authentication is handled via AuthenticationRequiredEvent; do not break UI flow.
        this._logger.warn('[SelectProductForPaymentUseCase] Payment blocked for unauthenticated user', {
          productId: request.productId,
          error: error.message,
        });
        return;
      }

      this._logger.error('[SelectProductForPaymentUseCase] Failed to process payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: request.productId,
      });
      throw error;
    }
  }

  /**
   * Handle payment in browser environment
   */
  private async _handleBrowserPayment(productSnapshot: ProductPaymentSnapshot): Promise<void> {
    // Get user context from AuthService and app configuration
    const currentUser = this._authService.getCurrentUser();
    const appConfig = this._browser.getAppConfig();

    // Create user context using Domain Service
    const userContext = ProductPaymentService.createUserContext(
      currentUser,
      appConfig
    );

    // Build payment URL through Payment Redirect Port
    const paymentUrl = this._paymentRedirect.buildPaymentUrl({
      productId: productSnapshot.id,
      productTitle: productSnapshot.title,
      productPrice: productSnapshot.price,
      productCurrency: productSnapshot.currency,
      userId: userContext.userId,
      appId: userContext.appId
    });

    // Redirect through Payment Redirect Port
    this._paymentRedirect.redirectToPayment(paymentUrl);
  }

  /**
   * Handle payment in server environment
   */
  private async _handleServerPayment(
    productId: string,
    productSnapshot: ProductPaymentSnapshot
  ): Promise<void> {
    // Publish domain event for server-side processing
    await this._eventBus.publishAsync(
      new ProductSelectedForPaymentEvent(productId, productSnapshot)
    );

    this._logger.info('[SelectProductForPaymentUseCase] ProductSelectedForPaymentEvent published', {
      productId
    });
  }
}
