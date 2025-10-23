import { Result } from '../../../../shared/result/result';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentError } from '../../domain/errors/payment.error';

/**
 * Payment Repository Port
 * 
 * Defines the contract for payment data persistence
 * Generic interface - not tied to specific database implementation
 */
export interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Result<Payment, PaymentError>>;
  findById(id: string): Promise<Result<Payment | null, PaymentError>>;
  findByUserId(userId: string): Promise<Result<Payment[], PaymentError>>;
  findByProductId(productId: string): Promise<Result<Payment[], PaymentError>>;
}
