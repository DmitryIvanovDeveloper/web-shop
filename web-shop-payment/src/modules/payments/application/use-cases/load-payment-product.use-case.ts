import { inject, injectable } from 'inversify';
import { Result, Failure } from '../../../../shared/result/result';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PaymentProduct, PaymentProductRepositoryPort } from '../ports/payment-product.repository.port';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';

export interface LoadPaymentProductInput {
  productId: string;
  appId: string;
}

@injectable()
export class LoadPaymentProductUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
    @inject(PAYMENT_TYPES.PaymentProductRepository)
    private readonly productRepository: PaymentProductRepositoryPort
  ) {}

  public async execute(input: LoadPaymentProductInput): Promise<Result<PaymentProduct, Error>> {
    const { productId, appId } = input;

    if (!productId) {
      return Failure.fail(new Error('productId is required'));
    }
    if (!appId) {
      return Failure.fail(new Error('appId is required'));
    }

    this.logger.info('[LoadPaymentProductUseCase] Loading product', { productId, appId });
    return this.productRepository.getById(appId, productId);
  }
}

