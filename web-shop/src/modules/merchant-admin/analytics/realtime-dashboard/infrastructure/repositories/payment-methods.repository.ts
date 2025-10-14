import { injectable, inject } from 'inversify';
import { PaymentMethodsRepositoryPort } from '../../application/ports/payment-methods-repository.port';
import { PaymentMethodsSummary } from '../../domain/entities/payment-methods-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class PaymentMethodsRepository implements PaymentMethodsRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getPaymentMethodsSummary(): Promise<PaymentMethodsSummary> {
    const response = await this.httpClient.get<any>('/api/payment-methods/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch payment methods data: ${response.statusText}`);
    }

    return PaymentMethodsSummary.fromApiResponse(response.data);
  }
}

