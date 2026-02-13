import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface RevenueRepositoryPort {
  getRevenueSummary(): Promise<RevenueSummary>;
}

@injectable()
export class RevenueRepository implements RevenueRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getRevenueSummary(): Promise<RevenueSummary> {
    const response = await this.httpClient.get('/api/analytics/revenue.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch revenue summary: ${response.statusText}`);
    }

    return RevenueSummary.fromApiResponse(response.data);
  }
}