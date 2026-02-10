import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { TrendDataPoint } from '../../domain/types/trend.types';

export interface RevenueRepositoryPort {
  getRevenueSummary(startDate: Date, endDate: Date): Promise<RevenueSummary>;
  getRevenueTrend(startDate: Date, endDate: Date, interval: string): Promise<TrendDataPoint[]>;
}