import { inject, injectable } from 'inversify';
import type {
  AnalyticsKey,
  AnalyticsRepositoryPort,
} from '../../application/ports/analytics-repository.port';
import type { HttpClient } from '../../../../../../application/ports/http-client.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
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

interface SalesSummaryDto {
  kpi: {
    totalSales: number;
    transactions: number;
    arpu: number;
    currency: string;
  };
  trend?: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface RevenueSummaryDto {
  kpi: {
    totalRevenue: number;
    averageOrderValue: number;
    revenuePerVisitor: number;
    netIncome: number;
    monthlyGrowth: number;
    currency: string;
  };
  trend?: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface GeographySummaryDto {
  regions: Array<{
    country: string;
    percentage: number;
  }>;
}

interface ConversionSummaryDto {
  kpi: {
    conversionRate: number;
    refundRate: number;
  };
  channels: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

interface RetentionCurvePointDto {
  day: number;
  retention: number;
}

interface RetentionCurveDto {
  cohortId: string;
  cohortName: string;
  points: RetentionCurvePointDto[];
}

interface RetentionSummaryDto {
  curves: RetentionCurveDto[];
}

interface CohortChannelDto {
  channel: string;
  users: number;
  revenue: number;
  retention: number;
}

interface CohortSummaryDto {
  cohorts: CohortChannelDto[];
}

interface PaymentMethodDto {
  method: string;
  revenue: number;
  transactions: number;
  percentage: number;
}

interface PaymentMethodsSummaryDto {
  methods: PaymentMethodDto[];
}

interface RefundDto {
  id: string;
  transactionId: string;
  createdAt: string;
  amount: number;
  currency: string;
  reason: string;
  type: string;
}

interface RefundsSummaryDto {
  refunds: RefundDto[];
}

interface MarketingChannelSegmentDto {
  id: string;
  name: string;
  color: string;
  value: number;
}

interface MarketingChannelsPointDto {
  label: string;
  segments: MarketingChannelSegmentDto[];
}

interface MarketingChannelsSummaryDto {
  timeSeries: MarketingChannelsPointDto[];
}

interface TransactionDto {
  id: string;
  createdAt: string;
  user: string;
  amount: number;
  currency: string;
  country: string;
  method: string;
  status: string;
}

interface TransactionsSummaryDto {
  transactions: TransactionDto[];
}

@injectable()
export class AnalyticsRepository implements AnalyticsRepositoryPort {
  public constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async getByKey<TPayload = unknown>(key: AnalyticsKey): Promise<TPayload> {
    const response = await this.httpClient.get<TPayload>(`/api/analytics/${key}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch analytics payload for key "${key}": ${response.statusText}`);
    }

    return response.data;
  }

  public async getSalesSummary(): Promise<SalesSummary> {
    const data = await this.getByKey<SalesSummaryDto>('sales.summary');
    const dto: SalesSummaryDto = { ...data };
    return SalesSummary.fromApiResponse(dto);
  }

  public async getRevenueSummary(): Promise<RevenueSummary> {
    const data = await this.getByKey<RevenueSummaryDto>('revenue.summary');
    const dto: RevenueSummaryDto = { ...data };
    return RevenueSummary.fromApiResponse(dto);
  }

  public async getGeographySummary(): Promise<GeographySummary> {
    const data = await this.getByKey<GeographySummaryDto>('geography.summary');
    return GeographySummary.fromApiResponse(data);
  }

  public async getConversionSummary(): Promise<ConversionSummary> {
    const data = await this.getByKey<ConversionSummaryDto>('conversion.summary');
    return ConversionSummary.fromApiResponse(data);
  }

  public async getRetentionSummary(): Promise<RetentionSummary> {
    const data = await this.getByKey<RetentionSummaryDto>('retention.summary');
    return RetentionSummary.fromApiResponse(data);
  }

  public async getCohortSummary(): Promise<CohortSummary> {
    const data = await this.getByKey<CohortSummaryDto>('cohorts.summary');
    return CohortSummary.fromApiResponse(data);
  }

  public async getPaymentMethodsSummary(): Promise<PaymentMethodsSummary> {
    const data = await this.getByKey<PaymentMethodsSummaryDto>('payment-methods.summary');
    return PaymentMethodsSummary.fromApiResponse(data);
  }

  public async getRefundsSummary(): Promise<RefundsSummary> {
    const data = await this.getByKey<RefundsSummaryDto>('refunds.summary');
    return RefundsSummary.fromApiResponse(data);
  }

  public async getMarketingChannelsSummary(): Promise<MarketingChannelsSummary> {
    const data = await this.getByKey<MarketingChannelsSummaryDto>('marketing-channels.summary');
    return MarketingChannelsSummary.fromApiResponse(data);
  }

  public async getTransactionsSummary(): Promise<TransactionsSummary> {
    const data = await this.getByKey<TransactionsSummaryDto>('transactions.summary');
    return TransactionsSummary.fromApiResponse(data);
  }
}
