import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';
import { RetentionSummary } from '../../domain/entities/retention-summary.entity';
import { CohortSummary } from '../../domain/entities/cohort-summary.entity';
import { PaymentMethodsSummary } from '../../domain/entities/payment-methods-summary.entity';
import { RefundsSummary } from '../../domain/entities/refunds-summary.entity';
import { MarketingChannelsSummary } from '../../domain/entities/marketing-channels-summary.entity';
import { TransactionsSummary } from '../../domain/entities/transactions-summary.entity';

export type AnalyticsKey =
  | 'sales.summary'
  | 'revenue.summary'
  | 'geography.summary'
  | 'conversion.summary'
  | 'retention.summary'
  | 'cohorts.summary'
  | 'transactions.summary'
  | 'payment-methods.summary'
  | 'refunds.summary'
  | 'marketing-channels.summary';

export interface AnalyticsRepositoryPort {
  
  getByKey<TPayload = unknown>(key: AnalyticsKey): Promise<TPayload>;

  getSalesSummary(): Promise<SalesSummary>;
  getRevenueSummary(): Promise<RevenueSummary>;
  getGeographySummary(): Promise<GeographySummary>;
  getConversionSummary(): Promise<ConversionSummary>;
  getRetentionSummary(): Promise<RetentionSummary>;
  getCohortSummary(): Promise<CohortSummary>;
  getPaymentMethodsSummary(): Promise<PaymentMethodsSummary>;
  getRefundsSummary(): Promise<RefundsSummary>;
  getMarketingChannelsSummary(): Promise<MarketingChannelsSummary>;
  getTransactionsSummary(): Promise<TransactionsSummary>;
}

