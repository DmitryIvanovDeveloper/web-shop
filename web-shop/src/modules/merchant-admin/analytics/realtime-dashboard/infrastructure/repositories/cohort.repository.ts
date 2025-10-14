import { injectable, inject } from 'inversify';
import { CohortRepositoryPort } from '../../application/ports/cohort-repository.port';
import { CohortSummary } from '../../domain/entities/cohort-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class CohortRepository implements CohortRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getCohortSummary(): Promise<CohortSummary> {
    const response = await this.httpClient.get<any>('/api/cohorts/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch cohort data: ${response.statusText}`);
    }

    return CohortSummary.fromApiResponse(response.data);
  }
}

