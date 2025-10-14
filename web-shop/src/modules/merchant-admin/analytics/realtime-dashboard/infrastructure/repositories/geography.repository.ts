import { injectable, inject } from 'inversify';
import { GeographyRepositoryPort } from '../../application/ports/geography-repository.port';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
export class GeographyRepository implements GeographyRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getGeographySummary(): Promise<GeographySummary> {
    try {
      const response = await this.httpClient.get<any>('/api/geography/summary');
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch geography data: ${response.statusText}`);
      }

      // Возвращаем данные без фильтрации (фильтрация будет добавлена позже)
      return GeographySummary.fromApiResponse(response.data);
    } catch (error) {
      console.error('Error loading geography data:', error);
      throw error;
    }
  }
}


