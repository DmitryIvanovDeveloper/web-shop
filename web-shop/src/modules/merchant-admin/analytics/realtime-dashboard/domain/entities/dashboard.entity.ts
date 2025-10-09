import { SalesSummary } from './sales-summary.entity';
import { RevenueSummary } from './revenue-summary.entity';
import { GeographySummary } from './geography-summary.entity';
import { ConversionSummary } from './conversion-summary.entity';
import { RetentionSummary } from './retention-summary.entity';
import { CohortSummary } from './cohort-summary.entity';
import { PaymentMethodsSummary } from './payment-methods-summary.entity';
import { TransactionsSummary } from './transactions-summary.entity';
import { RefundsSummary } from './refunds-summary.entity';
import { MarketingChannelsSummary } from './marketing-channels-summary.entity';

export class Dashboard {
  constructor(
    public readonly salesSummary?: SalesSummary,
    public readonly revenueSummary?: RevenueSummary,
    public readonly geographySummary?: GeographySummary,
    public readonly conversionSummary?: ConversionSummary,
    public readonly retentionSummary?: RetentionSummary,
    public readonly cohortSummary?: CohortSummary,
    public readonly paymentMethodsSummary?: PaymentMethodsSummary,
    public readonly transactionsSummary?: TransactionsSummary,
    public readonly refundsSummary?: RefundsSummary,
    public readonly marketingChannelsSummary?: MarketingChannelsSummary
  ) {}
}
