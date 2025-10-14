import { injectable, inject } from 'inversify';
import { SalesRepositoryPort } from '../../application/ports/sales-repository.port';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { FilterApplier } from '../utils/filter-applier';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

@injectable()
export class SalesRepository implements SalesRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getSalesSummary(): Promise<SalesSummary> {
    // Load current filters
    const filters = await FilterApplier.loadCurrentFilters();
    
    // Read from mock-backed API; HttpClientMock maps /api/* -> /mocks/api/*.json
    const response = await this.httpClient.get<any>('/api/sales/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch sales data: ${response.statusText}`);
    }

    // Apply filters to trend data if present
    let data = response.data;
    if (data.trend && Array.isArray(data.trend)) {
      data.trend = FilterApplier.applyDateFilter(data.trend, filters.dateRange);
    }

    return SalesSummary.fromApiResponse(data);
  }
}
