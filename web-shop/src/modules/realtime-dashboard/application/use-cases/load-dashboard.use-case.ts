import { Dashboard } from '../../domain/entities/dashboard.entity';
import { DashboardRepositoryPort } from '../ports/dashboard-repository.port';
import { SalesRepositoryPort } from '../ports/sales-repository.port';
import { RevenueRepositoryPort } from '../ports/revenue-repository.port';
import { GeographyRepositoryPort } from '../ports/geography-repository.port';
import { ConversionRepositoryPort } from '../ports/conversion-repository.port';

export class LoadDashboardUseCase {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryPort,
    private readonly salesRepository: SalesRepositoryPort,
    private readonly revenueRepository: RevenueRepositoryPort,
    private readonly geographyRepository: GeographyRepositoryPort,
    private readonly conversionRepository: ConversionRepositoryPort
  ) {}

  async execute(userId: string): Promise<Dashboard> {
    // Загружаем все данные параллельно
    const [salesSummary, revenueSummary, geographySummary, conversionSummary] = await Promise.all([
      this.salesRepository.getSalesSummary(),
      this.revenueRepository.getRevenueSummary(),
      this.geographyRepository.getGeographySummary(),
      this.conversionRepository.getConversionSummary()
    ]);
    
    // Создаем дашборд с помощью репозитория
    return this.dashboardRepository.create(
      salesSummary,
      revenueSummary,
      geographySummary,
      conversionSummary
    );
  }
}
