import { Container } from 'inversify';
import { TYPES } from './types';

// Services
import { PeriodComparisonService } from '../services/period-comparison.service';
import { TrendCalculationService } from '../services/trend-calculation.service';

// Repositories
import { SalesRepository } from '../repositories/sales.repository';
import { RevenueRepository } from '../repositories/revenue.repository';

// Use Cases
import { LoadSalesUseCase } from '../../application/use-cases/load-sales.use-case';
import { LoadRevenueUseCase } from '../../application/use-cases/load-revenue.use-case';

// Presenters
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';

export function bindRealtimeDashboard(container: Container): void {
  // Services
  container.bind<PeriodComparisonService>(TYPES.PeriodComparisonService).to(PeriodComparisonService).inSingletonScope();
  container.bind<TrendCalculationService>(TYPES.TrendCalculationService).to(TrendCalculationService).inSingletonScope();

  // Repositories
  container.bind<SalesRepository>(TYPES.SalesRepository).to(SalesRepository).inSingletonScope();
  container.bind<RevenueRepository>(TYPES.RevenueRepository).to(RevenueRepository).inSingletonScope();

  // Use Cases
  container.bind<LoadSalesUseCase>(TYPES.LoadSalesUseCase).to(LoadSalesUseCase).inSingletonScope();
  container.bind<LoadRevenueUseCase>(TYPES.LoadRevenueUseCase).to(LoadRevenueUseCase).inSingletonScope();

  // Presenters
  container.bind<DashboardPresenter>(TYPES.DashboardPresenter).to(DashboardPresenter).inSingletonScope();
}
