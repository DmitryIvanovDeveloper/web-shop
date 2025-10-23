import { injectable, inject } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PaymentRepositoryPort } from '../../application/ports/payment-repository.port';
import type { PaymentStoragePort, PaymentStorageData } from '../../application/ports/payment-storage.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentError } from '../../domain/errors/payment.error';
import { PAYMENT_TYPES } from '../bootstrap/types';

/**
 * Payment Repository Implementation
 * 
 * Infrastructure implementation of PaymentRepositoryPort
 * Uses PaymentStoragePort for data persistence (Dependency Inversion)
 */
@injectable()
export class PaymentRepository implements PaymentRepositoryPort {
  constructor(
    @inject(PAYMENT_TYPES.PaymentStorage)
    private readonly _storage: PaymentStoragePort
  ) {}

  public async save(payment: Payment): Promise<Result<Payment, PaymentError>> {
    try {
      const storageData: PaymentStorageData = {
        id: payment.id,
        user_id: payment.userId,
        product_id: payment.productId,
        app_id: payment.appId, // APP123 from query params
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider_intent_id: payment.providerIntentId,
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString()
      };

      await this._storage.insert(storageData);
      return Success.ok(payment);
    } catch (error) {
      return Failure.fail(new PaymentError(
        'Failed to save payment transaction',
        'SAVE_PAYMENT_ERROR'
      ));
    }
  }

  public async findById(id: string): Promise<Result<Payment | null, PaymentError>> {
    const result = await this._storage.findById(id);

    if (isFailure(result)) {
      return Failure.fail(result.error);
    }

    if (result.data === null) {
      return Success.ok(null);
    }

    return Success.ok(this.mapStorageDataToPayment(result.data));
  }

  public async findByUserId(userId: string): Promise<Result<Payment[], PaymentError>> {
    const result = await this._storage.findByUserId(userId);

    if (isFailure(result)) {
      return Failure.fail(result.error);
    }

    const payments = result.data.map(data => this.mapStorageDataToPayment(data));
    return Success.ok(payments);
  }

  public async findByProductId(productId: string): Promise<Result<Payment[], PaymentError>> {
    const result = await this._storage.findByProductId(productId);

    if (isFailure(result)) {
      return Failure.fail(result.error);
    }

    const payments = result.data.map(data => this.mapStorageDataToPayment(data));
    return Success.ok(payments);
  }

  /**
   * Maps storage data to domain entity
   */
  private mapStorageDataToPayment(data: PaymentStorageData): Payment {
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status as Payment['status'],
      providerIntentId: data.provider_intent_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
