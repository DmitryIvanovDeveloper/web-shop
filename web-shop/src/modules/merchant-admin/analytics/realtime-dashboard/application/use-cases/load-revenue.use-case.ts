import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { Period, DashboardFilters, DataUnavailableError } from '../../domain';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import type { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadRevenueUseCase {
  constructor(
    @inject(TYPES.AnalyticsRepository)
    private analyticsRepository: AnalyticsRepositoryPort,
    @inject(TYPES.PeriodComparisonService)
    private periodComparisonService: PeriodComparisonService
  ) {}

  async execute(period: Period, filters: DashboardFilters): Promise<Result<RevenueSummary, DataUnavailableError>> {
    try {

      const revenueSummary = await this.analyticsRepository.getRevenueSummary();
      return Result.ok(revenueSummary);

    } catch (error) {
      return Result.error(new DataUnavailableError('revenue-summary', `Failed to load revenue summary: ${error}`));
    }
  }
}
