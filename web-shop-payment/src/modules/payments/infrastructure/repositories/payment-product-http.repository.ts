import { inject, injectable } from 'inversify';
import type { PaymentProduct, PaymentProductRepositoryPort } from '../../application/ports/payment-product.repository.port';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES as ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

interface ProductByIdResponse {
  product?: {
    id: string;
    title: string;
    price: number;
    currency?: string | null;
  };
  error?: string;
}

@injectable()
export class PaymentProductHttpRepository implements PaymentProductRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async getById(appId: string, productId: string): Promise<Result<PaymentProduct, Error>> {
    this.logger.info('[PaymentProductHttpRepository] Fetching product by id', { appId, productId });

    try {
      const response = await this.httpClient.get<ProductByIdResponse>(
        `/api/products/by-id?appId=${encodeURIComponent(appId)}&productId=${encodeURIComponent(productId)}`
      );

      if (response.status === 404) {
        this.logger.warn('[PaymentProductHttpRepository] Product not found', { productId, appId });
        return Failure.fail(new Error('Product not found'));
      }

      if (response.status !== 200) {
        this.logger.error('[PaymentProductHttpRepository] Failed to load product', {
          status: response.status,
          statusText: response.statusText
        });
        return Failure.fail(new Error(response.data?.error || 'Failed to load product'));
      }

      const product = response.data?.product;

      if (!product) {
        this.logger.warn('[PaymentProductHttpRepository] Product not found', { productId });
        return Failure.fail(new Error('Product not found'));
      }

      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        return Failure.fail(new Error('Invalid product price'));
      }

      const mapped: PaymentProduct = {
        id: product.id,
        title: product.title,
        price,
        currency: product.currency || 'USD'
      };

      return Success.ok(mapped);
    } catch (error) {
      this.logger.error('[PaymentProductHttpRepository] Unexpected error loading product', { error, productId });
      return Failure.fail(error as Error);
    }
  }
}

