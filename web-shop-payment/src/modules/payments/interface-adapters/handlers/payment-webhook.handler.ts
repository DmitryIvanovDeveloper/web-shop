import { injectable, inject } from 'inversify';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { PaymentConfirmedEvent } from '../../../../shared/events/payment-events';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { SavePaymentTransactionUseCase } from '../../application/use-cases/save-payment-transaction.use-case';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { isFailure } from '../../../../shared/result/result';

/**
 * Payment Webhook Handler
 * 
 * Handles PaymentConfirmedEvent (simulates webhook from payment provider)
 * Saves payment transaction to database
 */
@injectable()
export class PaymentWebhookHandler implements IAsyncEventHandler<PaymentConfirmedEvent> {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PAYMENT_TYPES.SavePaymentTransactionUseCase)
    private readonly _savePaymentTransactionUseCase: SavePaymentTransactionUseCase
  ) {}

  public canHandle(event: PaymentConfirmedEvent): boolean {
    return event.type === 'PaymentConfirmedEvent';
  }

  public async handleAsync(event: PaymentConfirmedEvent): Promise<void> {
    this._logger.info('[PaymentWebhookHandler] Handling payment confirmed event', {
      paymentIntentId: event.payload.paymentIntentId,
      productId: event.payload.productSnapshot.id,
      userId: event.payload.userId
    });

    try {
      // Save payment transaction to database
      const result = await this._savePaymentTransactionUseCase.execute({
        paymentIntentId: event.payload.paymentIntentId,
        userId: event.payload.userId,
        productId: event.payload.productSnapshot.id,
        amount: event.payload.productSnapshot.price,
        currency: event.payload.productSnapshot.currency,
        status: 'succeeded'
      });

      if (isFailure(result)) {
        this._logger.error('[PaymentWebhookHandler] Failed to save payment transaction', {
          error: result.error,
          paymentIntentId: event.payload.paymentIntentId
        });
        throw result.error;
      }

      this._logger.info('[PaymentWebhookHandler] Payment transaction saved successfully', {
        transactionId: result.data.transactionId,
        paymentIntentId: event.payload.paymentIntentId
      });
    } catch (error) {
      this._logger.error('[PaymentWebhookHandler] Failed to handle payment confirmed event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId: event.payload.paymentIntentId
      });
      throw error;
    }
  }
}
