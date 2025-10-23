import { injectable, inject } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { Payment, PaymentStatus } from '../../domain/entities/payment.entity';
import { PaymentError, PaymentErrorCode } from '../../domain/errors/payment.error';
import type { Logger } from '../../../../application/ports/logger.port';
import type { SavePaymentTransactionRequest, SavePaymentTransactionResponse } from './input-output/save-payment-transaction.io';

/**
 * Save Payment Transaction Use Case
 * 
 * Business logic for saving payment transactions to database
 * Creates domain entity and delegates to repository
 */
@injectable()
export class SavePaymentTransactionUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PAYMENT_TYPES.PaymentRepository)
    private readonly _paymentRepository: PaymentRepositoryPort
  ) {}

  public async execute(request: SavePaymentTransactionRequest): Promise<Result<SavePaymentTransactionResponse, PaymentError>> {
    this._logger.info('[SavePaymentTransactionUseCase] Saving payment transaction', { 
      paymentIntentId: request.paymentIntentId,
      productId: request.productId,
      userId: request.userId,
      amount: request.amount
    });

    // Validate input
    if (!request.paymentIntentId || !request.userId || !request.productId) {
      return Failure.fail(new PaymentError(
        'Missing required payment transaction data',
        PaymentErrorCode.INVALID_PAYMENT_ID
      ));
    }

    if (request.amount <= 0) {
      return Failure.fail(new PaymentError(
        'Invalid payment amount',
        PaymentErrorCode.INVALID_PAYMENT_AMOUNT
      ));
    }

    // Create payment domain entity
    const payment: Payment = {
      id: crypto.randomUUID(),
      userId: request.userId,
      productId: request.productId,
      amount: request.amount,
      currency: request.currency,
      status: request.status as PaymentStatus,
      providerIntentId: request.paymentIntentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save through repository
    const result = await this._paymentRepository.save(payment);

    if (isFailure(result)) {
      this._logger.error('[SavePaymentTransactionUseCase] Failed to save payment transaction', { 
        error: result.error,
        paymentIntentId: request.paymentIntentId
      });
      return Failure.fail(result.error);
    }

    this._logger.info('[SavePaymentTransactionUseCase] Payment transaction saved successfully', { 
      transactionId: result.data.id,
      paymentIntentId: request.paymentIntentId
    });

    return Success.ok({
      transactionId: result.data.id
    });
  }
}
