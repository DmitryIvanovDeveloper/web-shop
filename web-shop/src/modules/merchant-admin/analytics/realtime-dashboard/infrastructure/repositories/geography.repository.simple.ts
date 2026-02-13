import { inject, injectable } from 'inversify';
import type { HttpClient } from '@/application/ports/http-client.port';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class SimpleGeographyRepository {
  constructor(
    @inject(TYPES.HttpClient)
    private httpClient: HttpClient
  ) {}

  async getGeographySummary(): Promise<GeographySummary> {
    // Simple implementation that returns mock data
    const mockData = {
      regions: [
        { country: 'US', percentage: 45.0 },
        { country: 'EU', percentage: 30.0 },
        { country: 'Asia', percentage: 15.0 },
        { country: 'LATAM', percentage: 7.0 },
        { country: 'Other', percentage: 3.0 }
      ]
    };

    return GeographySummary.fromApiResponse(mockData);
  }
}