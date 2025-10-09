import { PaymentMethodsRepositoryPort } from '../../application/ports/payment-methods-repository.port';
import { PaymentMethodsSummary } from '../../domain/entities/payment-methods-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class PaymentMethodsRepository implements PaymentMethodsRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getPaymentMethodsSummary(): Promise<PaymentMethodsSummary> {
    const response = await this.httpClient.get<any>('/api/payment-methods/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch payment methods data: ${response.statusText}`);
    }

    return PaymentMethodsSummary.fromApiResponse(response.data);
  }
}

