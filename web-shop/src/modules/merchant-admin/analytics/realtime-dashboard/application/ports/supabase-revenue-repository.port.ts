import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';

export interface SupabaseRevenueRepositoryPort {
  getRevenueSummary(): Promise<RevenueSummary>;
}