import { injectable, inject } from 'inversify';
import { RevenueRepositoryPort } from '../../application/ports/revenue-repository.port';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { FilterApplier } from '../utils/filter-applier';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

@injectable()
export class RevenueRepository implements RevenueRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getRevenueSummary(): Promise<RevenueSummary> {
    // Load current filters
    const filters = await FilterApplier.loadCurrentFilters();
    
    const response = await this.httpClient.get<any>('/api/revenue/summary');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch revenue data: ${response.statusText}`);
    }

    // Apply filters to trend data if present
    let data = response.data;
    if (data.trend && Array.isArray(data.trend)) {
      data.trend = FilterApplier.applyDateFilter(data.trend, filters.dateRange);
    }

    return RevenueSummary.fromApiResponse(data);
  }
}
