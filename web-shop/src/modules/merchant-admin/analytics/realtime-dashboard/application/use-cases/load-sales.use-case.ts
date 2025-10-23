import { inject, injectable } from 'inversify';
import { Result } from '../../../../../../shared/domain/result/result';
import { Period, DashboardFilters, DataUnavailableError, SalesSummary } from '../../domain';
import type { SalesRepositoryPort } from '../ports/sales-repository.port';
import { PeriodComparisonService } from '../../infrastructure/services/period-comparison.service';
import { TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class LoadSalesUseCase {
  constructor(
    @inject(TYPES.SalesRepository) private salesRepository: SalesRepositoryPort,
    @inject(TYPES.PeriodComparisonService) private periodComparisonService: PeriodComparisonService
  ) {}

  async execute(period: Period, filters: DashboardFilters): Promise<Result<SalesSummary, DataUnavailableError>> {
    try {
      // Получаем данные о продажах за текущий период
      // Repository уже возвращает SalesSummary с comparison данными из API
      const salesResult = await this.salesRepository.getSalesSummary(period, filters);

      if (!salesResult.isSuccess() || !salesResult.data) {
        return salesResult.isSuccess() 
          ? Result.error(new DataUnavailableError('sales-summary', 'No data returned'))
          : salesResult;
      }

      // Repository уже создал полный SalesSummary с comparison
      return Result.ok(salesResult.data);

    } catch (error) {
      return Result.error(new DataUnavailableError('sales-summary', `Failed to load sales summary: ${error}`));
    }
  }
}
