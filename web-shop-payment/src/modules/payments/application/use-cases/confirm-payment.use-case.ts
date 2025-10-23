import { injectable, inject } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PaymentServicePort } from '../ports/payment-service.port';
import { PaymentError, PaymentErrorCode } from '../../domain/errors/payment.error';
import type { Logger } from '../../../../application/ports/logger.port';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import { PaymentConfirmedEvent } from '../../../../shared/events/payment-events';
import type { ConfirmPaymentRequest, ConfirmPaymentResponse } from './input-output/confirm-payment.io';

/**
 * Confirm Payment Use Case
 * 
 * Business logic for confirming payments
 * Handles payment confirmation and publishes domain events
 */
@injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(ROOT_TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(PAYMENT_TYPES.PaymentService)
    private readonly _paymentService: PaymentServicePort
  ) {}

  public async execute(request: ConfirmPaymentRequest): Promise<Result<ConfirmPaymentResponse, PaymentError>> {
    this._logger.info('[ConfirmPaymentUseCase] Confirming payment', { 
      paymentIntentId: request.paymentIntentId,
      productId: request.productSnapshot.id,
      userId: request.userId
    });

    // Validate payment context
    if (!request.paymentContext.providerInstance || !request.paymentContext.elementsInstance) {
      this._logger.error('[ConfirmPaymentUseCase] Invalid payment context', {
        hasProvider: !!request.paymentContext.providerInstance,
        hasElements: !!request.paymentContext.elementsInstance
      });
      return Failure.fail(new PaymentError(
        'Invalid payment context provided',
        PaymentErrorCode.INVALID_PAYMENT_CONTEXT
      ));
    }

    // Confirm payment through service
    const confirmResult = await this._paymentService.confirmPayment({
      paymentIntentId: request.paymentIntentId,
      paymentContext: request.paymentContext
    });

    if (isFailure(confirmResult)) {
      this._logger.error('[ConfirmPaymentUseCase] Payment confirmation failed', { 
        error: confirmResult.error,
        paymentIntentId: request.paymentIntentId
      });
      return Failure.fail(confirmResult.error);
    }

    // Publish domain event (PaymentWebhookHandler will save to database)
    await this._eventBus.publishAsync(
      new PaymentConfirmedEvent(
        request.paymentIntentId,
        request.productSnapshot,
        request.userId
      )
    );

    this._logger.info('[ConfirmPaymentUseCase] Payment confirmed successfully', { 
      paymentIntentId: request.paymentIntentId,
      productId: request.productSnapshot.id
    });

    return Success.ok(undefined);
  }
}
