import { inject, injectable } from 'inversify';
import { Result } from '../../../../../../shared/domain/result/result';
import { Period, DashboardFilters, DataUnavailableError } from '../../domain';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import type { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadSalesUseCase {
  constructor(
    @inject(TYPES.AnalyticsRepository) private analyticsRepository: AnalyticsRepositoryPort,
    @inject(TYPES.PeriodComparisonService) private periodComparisonService: PeriodComparisonService
  ) {}

  async execute(period: Period, filters: DashboardFilters): Promise<Result<SalesSummary, DataUnavailableError>> {
    try {
      // Получаем данные о продажах за текущий период
      // Repository уже возвращает SalesSummary с comparison данными из API
      const salesSummary = await this.analyticsRepository.getSalesSummary();
      return Result.ok(salesSummary);

    } catch (error) {
      return Result.error(new DataUnavailableError('sales-summary', `Failed to load sales summary: ${error}`));
    }
  }
}
