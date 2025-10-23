import { injectable, inject } from 'inversify';
import { PaymentStoragePort, PaymentStorageData } from '../../application/ports/payment-storage.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PAYMENT_TYPES } from '../bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { PaymentError, PaymentErrorCode } from '../../domain/errors/payment.error';

/**
 * In-Memory Payment Storage Implementation
 * 
 * Infrastructure implementation of PaymentStoragePort using in-memory storage
 * Suitable for Payment Service that doesn't need persistent storage
 */
@injectable()
export class InMemoryPaymentStorage implements PaymentStoragePort {
  private payments: Map<string, PaymentStorageData> = new Map();

  constructor(
    @inject(ROOT_TYPES.Logger) private readonly _logger: Logger
  ) {
    this._logger.info('[InMemoryPaymentStorage] Initialized in-memory payment storage');
  }

  public async save(payment: Payment): Promise<void> {
    try {
      this._logger.info('[InMemoryPaymentStorage] Saving payment data', { 
        paymentId: payment.id, 
        userId: payment.userId, 
        productId: payment.productId 
      });

      // Convert Payment to PaymentStorageData
      const storageData: PaymentStorageData = {
        id: payment.id,
        user_id: payment.userId,
        product_id: payment.productId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider_intent_id: payment.providerIntentId,
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString()
      };

      // Store payment in memory
      this.payments.set(payment.id, storageData);

      this._logger.info('[InMemoryPaymentStorage] Payment data saved successfully', { 
        paymentId: payment.id,
        totalPayments: this.payments.size
      });
    } catch (error) {
      this._logger.error('[InMemoryPaymentStorage] Unexpected error saving payment', { 
        error, 
        paymentId: payment.id 
      });
      throw error;
    }
  }

  public async insert(storageData: PaymentStorageData): Promise<Result<PaymentStorageData, PaymentError>> {
    try {
      this._logger.info('[InMemoryPaymentStorage] Inserting payment data', { 
        paymentId: storageData.id, 
        userId: storageData.user_id, 
        productId: storageData.product_id 
      });

      // Store payment in memory
      this.payments.set(storageData.id, storageData);

      this._logger.info('[InMemoryPaymentStorage] Payment data inserted successfully', { 
        paymentId: storageData.id,
        totalPayments: this.payments.size
      });

      return Success.ok(storageData);
    } catch (error) {
      this._logger.error('[InMemoryPaymentStorage] Unexpected error inserting payment', { 
        error, 
        paymentId: storageData.id 
      });
      return Failure.fail(new PaymentError(
        'Failed to insert payment',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async findById(id: string): Promise<Result<PaymentStorageData | null, PaymentError>> {
    try {
      this._logger.info('[InMemoryPaymentStorage] Finding payment by id', { id });

      const payment = this.payments.get(id);

      if (!payment) {
        this._logger.info('[InMemoryPaymentStorage] Payment not found', { id });
        return Success.ok(null);
      }

      this._logger.info('[InMemoryPaymentStorage] Payment found successfully', { id });
      return Success.ok(payment);
    } catch (error) {
      this._logger.error('[InMemoryPaymentStorage] Unexpected error finding payment', { 
        error, 
        id 
      });
      return Failure.fail(new PaymentError(
        'Failed to find payment',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async findByUserId(userId: string): Promise<Result<PaymentStorageData[], PaymentError>> {
    try {
      this._logger.info('[InMemoryPaymentStorage] Finding payments by user id', { userId });

      const userPayments = Array.from(this.payments.values())
        .filter(payment => payment.user_id === userId);

      this._logger.info('[InMemoryPaymentStorage] Found payments for user', { 
        userId, 
        count: userPayments.length 
      });

      return Success.ok(userPayments);
    } catch (error) {
      this._logger.error('[InMemoryPaymentStorage] Unexpected error finding payments by user', { 
        error, 
        userId 
      });
      return Failure.fail(new PaymentError(
        'Failed to find payments by user',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async findByProductId(productId: string): Promise<Result<PaymentStorageData[], PaymentError>> {
    try {
      this._logger.info('[InMemoryPaymentStorage] Finding payments by product id', { productId });

      const productPayments = Array.from(this.payments.values())
        .filter(payment => payment.product_id === productId);

      this._logger.info('[InMemoryPaymentStorage] Found payments for product', { 
        productId, 
        count: productPayments.length 
      });

      return Success.ok(productPayments);
    } catch (error) {
      this._logger.error('[InMemoryPaymentStorage] Unexpected error finding payments by product', { 
        error, 
        productId 
      });
      return Failure.fail(new PaymentError(
        'Failed to find payments by product',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async clear(): Promise<void> {
    this.payments.clear();
    this._logger.info('[InMemoryPaymentStorage] Cleared all payments');
  }

  public async getAll(): Promise<PaymentStorageData[]> {
    return Array.from(this.payments.values());
  }

  public getCount(): number {
    return this.payments.size;
  }
}
