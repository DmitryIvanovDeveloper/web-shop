import { DashboardRepositoryPort } from '../../application/ports/dashboard-repository.port';
import { Dashboard } from '../../domain/entities/dashboard.entity';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';

export class DashboardRepository implements DashboardRepositoryPort {
  private dashboards = new Map<string, Dashboard>();

  public create(
    salesSummary?: SalesSummary,
    revenueSummary?: RevenueSummary,
    geographySummary?: GeographySummary,
    conversionSummary?: ConversionSummary
  ): Dashboard {
    return new Dashboard(salesSummary, revenueSummary, geographySummary, conversionSummary);
  }

  public async findById(id: string): Promise<Dashboard | null> {
    return this.dashboards.get(id) || null;
  }

  public async findByUserId(userId: string): Promise<Dashboard | null> {
    // For simplicity, using userId as id
    return this.dashboards.get(`dashboard-${userId}`) || null;
  }

  public async save(dashboard: Dashboard): Promise<void> {
    // Since Dashboard doesn't have id/userId, we can't store it
    // This is a mock implementation
  }
}
