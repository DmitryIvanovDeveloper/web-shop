import { injectable, inject } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { SavePaymentTransactionUseCase } from '../use-cases/save-payment-transaction.use-case';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Stripe Payment Webhook Data
 * Data extracted from Stripe webhook events
 */
export interface StripePaymentWebhookData {
  paymentIntentId: string;
  userId: string;
  appId: string;
  productId: string;
  amount: number;
  currency: string;
}

/**
 * Webhook Service Port
 * Application Service that provides facade for webhook handlers
 * Coordinates payment webhook processing with domain UseCases
 */
export interface WebhookServicePort {
  handleStripePaymentSucceeded(data: StripePaymentWebhookData): Promise<Result<void, Error>>;
  handleStripePaymentFailed(data: StripePaymentWebhookData): Promise<Result<void, Error>>;
}

/**
 * Webhook Service Implementation
 * 
 * Application Service that coordinates webhook event processing
 * Delegates to appropriate UseCases for business logic execution
 * Follows Application Service pattern (like AuthService in web-shop-client)
 */
@injectable()
export class WebhookService implements WebhookServicePort {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(PAYMENT_TYPES.SavePaymentTransactionUseCase)
    private readonly _savePaymentTransactionUseCase: SavePaymentTransactionUseCase
  ) {}

  /**
   * Handle successful payment from Stripe webhook
   * 
   * @param data - Payment data extracted from Stripe webhook event
   * @returns Result indicating success or failure
   */
  public async handleStripePaymentSucceeded(
    data: StripePaymentWebhookData
  ): Promise<Result<void, Error>> {
    this._logger.info('[WebhookService] Processing payment succeeded webhook', {
      paymentIntentId: data.paymentIntentId,
      userId: data.userId,
      appId: data.appId,
      productId: data.productId
    });

    try {
      // Delegate to SavePaymentTransactionUseCase
      const result = await this._savePaymentTransactionUseCase.execute({
        paymentIntentId: data.paymentIntentId,
        userId: data.userId,
        appId: data.appId,
        productId: data.productId,
        amount: data.amount,
        currency: data.currency,
        status: 'succeeded'
      });

      if (isFailure(result)) {
        this._logger.error('[WebhookService] Failed to save payment transaction', {
          error: result.error,
          paymentIntentId: data.paymentIntentId
        });
        return Failure.fail(result.error);
      }

      this._logger.info('[WebhookService] Payment transaction saved successfully', {
        transactionId: result.data.transactionId,
        paymentIntentId: data.paymentIntentId
      });

      return Success.ok(undefined);
    } catch (error) {
      this._logger.error('[WebhookService] Unexpected error processing webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId: data.paymentIntentId
      });
      
      return Failure.fail(
        error instanceof Error 
          ? error 
          : new Error('Unexpected error processing payment webhook')
      );
    }
  }

  /**
   * Handle failed payment from Stripe webhook
   * 
   * @param data - Payment data extracted from Stripe webhook event
   * @returns Result indicating success or failure
   */
  public async handleStripePaymentFailed(
    data: StripePaymentWebhookData
  ): Promise<Result<void, Error>> {
    this._logger.info('[WebhookService] Processing payment failed webhook', {
      paymentIntentId: data.paymentIntentId,
      userId: data.userId,
      appId: data.appId,
      productId: data.productId
    });

    try {
      // Save failed payment transaction for audit trail
      const result = await this._savePaymentTransactionUseCase.execute({
        paymentIntentId: data.paymentIntentId,
        userId: data.userId,
        appId: data.appId,
        productId: data.productId,
        amount: data.amount,
        currency: data.currency,
        status: 'failed'
      });

      if (isFailure(result)) {
        this._logger.error('[WebhookService] Failed to save failed payment transaction', {
          error: result.error,
          paymentIntentId: data.paymentIntentId
        });
        return Failure.fail(result.error);
      }

      this._logger.info('[WebhookService] Failed payment transaction recorded', {
        transactionId: result.data.transactionId,
        paymentIntentId: data.paymentIntentId
      });

      return Success.ok(undefined);
    } catch (error) {
      this._logger.error('[WebhookService] Unexpected error processing failed payment webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId: data.paymentIntentId
      });
      
      return Failure.fail(
        error instanceof Error 
          ? error 
          : new Error('Unexpected error processing failed payment webhook')
      );
    }
  }
}

