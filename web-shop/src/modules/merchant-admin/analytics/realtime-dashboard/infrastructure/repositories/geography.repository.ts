import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

export interface GeographyRepositoryPort {
  getGeographySummary(): Promise<GeographySummary>;
}

@injectable()
export class GeographyRepository implements GeographyRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getGeographySummary(): Promise<GeographySummary> {
    const response = await this.httpClient.get('/api/analytics/geography.summary');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch geography summary: ${response.statusText}`);
    }

    return GeographySummary.fromApiResponse(response.data);
  }
}