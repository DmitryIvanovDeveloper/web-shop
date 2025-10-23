import { injectable, inject } from 'inversify';
import { Result, Success, Failure, isSuccess, isFailure } from '../../../../shared/result/result';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PaymentServicePort } from '../ports/payment-service.port';
import { PaymentError, PaymentErrorCode, InvalidPaymentAmountError, InvalidCurrencyError } from '../../domain/errors/payment.error';
import type { Logger } from '../../../../application/ports/logger.port';
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from './input-output/create-payment-intent.io';

/**
 * Create Payment Intent Use Case
 * 
 * Business logic for creating payment intents
 * Validates input and delegates to payment service
 */
@injectable()
export class CreatePaymentIntentUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PAYMENT_TYPES.PaymentService)
    private readonly _paymentService: PaymentServicePort
  ) {}

  public async execute(request: CreatePaymentIntentRequest): Promise<Result<CreatePaymentIntentResponse, PaymentError>> {
    this._logger.info('[CreatePaymentIntentUseCase] Creating payment intent', { 
      productId: request.productId,
      amount: request.amount,
      currency: request.currency
    });

    // Validate amount
    if (request.amount <= 0) {
      return Failure.fail(new InvalidPaymentAmountError(request.amount));
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP'];
    if (!supportedCurrencies.includes(request.currency.toUpperCase())) {
      return Failure.fail(new InvalidCurrencyError(request.currency));
    }

    // Create payment intent through service
    const result = await this._paymentService.createPaymentIntent({
      amount: request.amount,
      currency: request.currency,
      productId: request.productId,
      metadata: request.metadata
    });

    if (isFailure(result)) {
      this._logger.error('[CreatePaymentIntentUseCase] Failed to create payment intent', { 
        error: result.error,
        productId: request.productId
      });
      return Failure.fail(result.error);
    }

    this._logger.info('[CreatePaymentIntentUseCase] Payment intent created successfully', { 
      intentId: result.data.intentId,
      status: result.data.status
    });

    return Success.ok({
      intentId: result.data.intentId,
      clientSecret: result.data.clientSecret,
      status: result.data.status
    });
  }
}
