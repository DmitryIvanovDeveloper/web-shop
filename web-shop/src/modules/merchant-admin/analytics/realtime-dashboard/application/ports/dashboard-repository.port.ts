import { Dashboard } from '../../domain/entities/dashboard.entity';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';

export interface DashboardRepositoryPort {
  create(
    salesSummary?: SalesSummary,
    revenueSummary?: RevenueSummary,
    geographySummary?: GeographySummary,
    conversionSummary?: ConversionSummary
  ): Dashboard;
  findById(id: string): Promise<Dashboard | null>;
  findByUserId(userId: string): Promise<Dashboard | null>;
  save(dashboard: Dashboard): Promise<void>;
}
