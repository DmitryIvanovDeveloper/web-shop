import { SalesRepositoryPort } from '../../application/ports/sales-repository.port';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { HttpClient } from '../../../../application/ports/http-client.port';

export class SalesRepository implements SalesRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getSalesSummary(): Promise<SalesSummary> {
    // read from static JSON in public
    const response = await this.httpClient.get<any>('/mocks/api/sales/summary.json');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch sales data: ${response.statusText}`);
    }

    return SalesSummary.fromApiResponse(response.data);
  }
}
