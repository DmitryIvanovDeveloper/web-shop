import { GeographyRepositoryPort } from '../../application/ports/geography-repository.port';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { HttpClient } from '../../../../../../application/ports/http-client.port';
import { FilterApplier } from '../utils/filter-applier';

export class GeographyRepository implements GeographyRepositoryPort {
  constructor(private readonly httpClient: HttpClient) {}

  public async getGeographySummary(): Promise<GeographySummary> {
    // Load current filters
    const filters = await FilterApplier.loadCurrentFilters();
    
    const response = await this.httpClient.get<any>('/api/geography/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch geography data: ${response.statusText}`);
    }

    // Apply geography filters to regions data
    let data = response.data;
    if (data.regions && Array.isArray(data.regions)) {
      data.regions = FilterApplier.applyGeographyFilter(
        data.regions.map((r: any) => ({ ...r, country: r.name })),
        filters.geography
      ).map((r: any) => {
        const { country, ...rest } = r;
        return { ...rest, name: country };
      });
    }

    return GeographySummary.fromApiResponse(data);
  }
}


