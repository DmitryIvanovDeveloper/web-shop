import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { RefundsSummary } from '../../domain/entities/refunds-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface RefundsRepositoryPort {
  getRefundsSummary(): Promise<RefundsSummary>;
}

@injectable()
export class RefundsRepository implements RefundsRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getRefundsSummary(): Promise<RefundsSummary> {
    const response = await this.httpClient.get('/api/analytics/refunds.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch refunds summary: ${response.statusText}`);
    }

    return RefundsSummary.fromApiResponse(response.data);
  }
}