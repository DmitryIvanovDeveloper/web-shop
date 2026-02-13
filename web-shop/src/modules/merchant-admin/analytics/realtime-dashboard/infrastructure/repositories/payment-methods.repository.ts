import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { PaymentMethodsSummary } from '../../domain/entities/payment-methods-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface PaymentMethodsRepositoryPort {
  getPaymentMethodsSummary(): Promise<PaymentMethodsSummary>;
}

@injectable()
export class PaymentMethodsRepository implements PaymentMethodsRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getPaymentMethodsSummary(): Promise<PaymentMethodsSummary> {
    const response = await this.httpClient.get('/api/analytics/payment-methods.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch payment methods summary: ${response.statusText}`);
    }

    return PaymentMethodsSummary.fromApiResponse(response.data);
  }
}