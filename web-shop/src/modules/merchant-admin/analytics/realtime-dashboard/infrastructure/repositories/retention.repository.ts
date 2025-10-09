import { RetentionRepositoryPort } from '../../application/ports/retention-repository.port';
import { RetentionSummary } from '../../domain/entities/retention-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class RetentionRepository implements RetentionRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getRetentionSummary(): Promise<RetentionSummary> {
    const response = await this.httpClient.get<any>('/api/retention/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch retention data: ${response.statusText}`);
    }

    return RetentionSummary.fromApiResponse(response.data);
  }
}

