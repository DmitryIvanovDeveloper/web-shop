import { RefundsRepositoryPort } from '../../application/ports/refunds-repository.port';
import { RefundsSummary } from '../../domain/entities/refunds-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class RefundsRepository implements RefundsRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getRefundsSummary(): Promise<RefundsSummary> {
    const response = await this.httpClient.get<any>('/api/refunds/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch refunds data: ${response.statusText}`);
    }

    return RefundsSummary.fromApiResponse(response.data);
  }
}

