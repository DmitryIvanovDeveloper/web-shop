import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { CohortSummary } from '../../domain/entities/cohort-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface CohortRepositoryPort {
  getCohortSummary(): Promise<CohortSummary>;
}

@injectable()
export class CohortRepository implements CohortRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getCohortSummary(): Promise<CohortSummary> {
    const response = await this.httpClient.get('/api/analytics/cohorts.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch cohort summary: ${response.statusText}`);
    }

    return CohortSummary.fromApiResponse(response.data);
  }
}