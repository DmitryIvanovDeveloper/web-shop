import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';

export interface RevenueRepositoryPort {
  getRevenueSummary(): Promise<RevenueSummary>;
}

