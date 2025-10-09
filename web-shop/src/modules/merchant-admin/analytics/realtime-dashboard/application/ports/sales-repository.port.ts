import { SalesSummary } from '../../domain/entities/sales-summary.entity';

export interface SalesRepositoryPort {
  getSalesSummary(): Promise<SalesSummary>;
}

