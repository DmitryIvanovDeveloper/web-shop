import { RevenueRepositoryPort } from '../../application/ports/revenue-repository.port';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class RevenueRepository implements RevenueRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getRevenueSummary(): Promise<RevenueSummary> {
    const response = await this.httpClient.get<any>('/api/revenue/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch revenue data: ${response.statusText}`);
    }

    return RevenueSummary.fromApiResponse(response.data);
  }
}
