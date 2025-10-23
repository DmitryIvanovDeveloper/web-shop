import { inject, injectable } from 'inversify';
import { Result } from '../../../../../../shared/domain/result/result';
import { Period, DashboardFilters, DataUnavailableError, RevenueSummary } from '../../domain';
import type { RevenueRepositoryPort } from '../ports/revenue-repository.port';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadRevenueUseCase {
  constructor(
    @inject(TYPES.RevenueRepository) private revenueRepository: RevenueRepositoryPort,
    @inject(TYPES.PeriodComparisonService) private periodComparisonService: PeriodComparisonService
  ) {}

  async execute(period: Period, filters: DashboardFilters): Promise<Result<RevenueSummary, DataUnavailableError>> {
    try {
      // Получаем данные о доходах за текущий период
      // Repository уже возвращает RevenueSummary с comparison данными из API
      const revenueResult = await this.revenueRepository.getRevenueSummary(period, filters);

      if (!revenueResult.isSuccess() || !revenueResult.data) {
        return revenueResult.isSuccess() 
          ? Result.error(new DataUnavailableError('revenue-summary', 'No data returned'))
          : revenueResult;
      }

      // Repository уже создал полный RevenueSummary с comparison
      return Result.ok(revenueResult.data);

    } catch (error) {
      return Result.error(new DataUnavailableError('revenue-summary', `Failed to load revenue summary: ${error}`));
    }
  }
}
