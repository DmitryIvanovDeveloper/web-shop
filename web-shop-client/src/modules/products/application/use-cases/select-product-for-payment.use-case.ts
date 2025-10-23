import { injectable, inject } from 'inversify';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PRODUCTS_TYPES } from '../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { ProductRepositoryPort } from '../ports/product-repository.port';
import { ProductSelectedForPaymentEvent } from '../../../../shared/events/product-events';

export interface SelectProductForPaymentRequest {
  productId: string;
}

@injectable()
export class SelectProductForPaymentUseCase {
  constructor(
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PRODUCTS_TYPES.ProductRepository)
    private readonly _productRepository: ProductRepositoryPort
  ) {}

  public async execute(request: SelectProductForPaymentRequest): Promise<void> {
    this._logger.info('[SelectProductForPaymentUseCase] Product selected for payment', {
      productId: request.productId
    });

    try {
      // Load product data from repository
      const product = await this._productRepository.getById(request.productId);
      
      if (!product) {
        throw new Error(`Product with id ${request.productId} not found`);
      }

      // Parse price correctly (remove $ symbol and convert to number)
      const price = product.currentPrice ? parseFloat(product.currentPrice.replace('$', '')) : 0;
      
      const productSnapshot = {
        id: product.id,
        title: product.title || 'Unknown Product',
        price: price,
        currency: 'USD' // TODO: Get from product or context
      };

      this._logger.info('[SelectProductForPaymentUseCase] Product data loaded', {
        productId: request.productId,
        productTitle: productSnapshot.title,
        productPrice: productSnapshot.price
      });

      // Redirect to external payment service
      if (typeof window !== 'undefined') {
        const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3002';
        const paymentUrl = new URL('/payment', paymentServiceUrl);
        paymentUrl.searchParams.set('productId', productSnapshot.id);
        paymentUrl.searchParams.set('title', productSnapshot.title);
        paymentUrl.searchParams.set('price', productSnapshot.price.toString());
        paymentUrl.searchParams.set('currency', productSnapshot.currency);
        
        this._logger.info('[SelectProductForPaymentUseCase] Redirecting to external payment service', {
          productId: request.productId,
          paymentUrl: paymentUrl.toString()
        });
        
        window.location.href = paymentUrl.toString();
        return;
      }

      // Fallback: Publish domain event (if not in browser)
      await this._eventBus.publishAsync(
        new ProductSelectedForPaymentEvent(request.productId, productSnapshot)
      );

      this._logger.info('[SelectProductForPaymentUseCase] ProductSelectedForPaymentEvent published', {
        productId: request.productId
      });
    } catch (error) {
      this._logger.error('[SelectProductForPaymentUseCase] Failed to publish ProductSelectedForPaymentEvent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: request.productId
      });
      throw error;
    }
  }
}
