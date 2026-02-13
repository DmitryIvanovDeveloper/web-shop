import { PaymentMethodsSummary } from '../../domain/entities/payment-methods-summary.entity';

export interface PaymentMethodsRepositoryPort {
  getPaymentMethodsSummary(): Promise<PaymentMethodsSummary>;
}