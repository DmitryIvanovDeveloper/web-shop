import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface SalesRepositoryPort {
  getSalesSummary(): Promise<SalesSummary>;
}

@injectable()
export class SalesRepository implements SalesRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getSalesSummary(): Promise<SalesSummary> {
    const response = await this.httpClient.get('/api/analytics/sales.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch sales summary: ${response.statusText}`);
    }

    return SalesSummary.fromApiResponse(response.data);
  }
}