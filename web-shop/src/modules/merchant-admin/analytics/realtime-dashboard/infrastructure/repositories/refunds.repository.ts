import { injectable, inject } from 'inversify';
import { RefundsRepositoryPort } from '../../application/ports/refunds-repository.port';
import { RefundsSummary } from '../../domain/entities/refunds-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class RefundsRepository implements RefundsRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getRefundsSummary(): Promise<RefundsSummary> {
    const response = await this.httpClient.get<any>('/api/refunds/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch refunds data: ${response.statusText}`);
    }

    return RefundsSummary.fromApiResponse(response.data);
  }
}

