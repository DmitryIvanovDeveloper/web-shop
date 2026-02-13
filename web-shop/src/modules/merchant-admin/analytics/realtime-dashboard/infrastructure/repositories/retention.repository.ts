import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { RetentionSummary } from '../../domain/entities/retention-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface RetentionRepositoryPort {
  getRetentionSummary(): Promise<RetentionSummary>;
}

@injectable()
export class RetentionRepository implements RetentionRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getRetentionSummary(): Promise<RetentionSummary> {
    const response = await this.httpClient.get('/api/analytics/retention.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch retention summary: ${response.statusText}`);
    }

    return RetentionSummary.fromApiResponse(response.data);
  }
}