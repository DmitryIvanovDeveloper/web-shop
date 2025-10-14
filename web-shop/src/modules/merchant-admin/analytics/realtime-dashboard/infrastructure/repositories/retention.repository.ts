import { injectable, inject } from 'inversify';
import { RetentionRepositoryPort } from '../../application/ports/retention-repository.port';
import { RetentionSummary } from '../../domain/entities/retention-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

export class RetentionRepository implements RetentionRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getRetentionSummary(): Promise<RetentionSummary> {
    const response = await this.httpClient.get<any>('/api/retention/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch retention data: ${response.statusText}`);
    }

    return RetentionSummary.fromApiResponse(response.data);
  }
}

