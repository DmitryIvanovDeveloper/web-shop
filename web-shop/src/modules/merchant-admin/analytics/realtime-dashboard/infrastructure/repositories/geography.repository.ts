import { GeographyRepositoryPort } from '../../application/ports/geography-repository.port';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';

export class GeographyRepository implements GeographyRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getGeographySummary(): Promise<GeographySummary> {
    const response = await this.httpClient.get<any>('/api/geography/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch geography data: ${response.statusText}`);
    }

    return GeographySummary.fromApiResponse(response.data);
  }
}


