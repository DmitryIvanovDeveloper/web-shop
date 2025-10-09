import { Dashboard } from '../../domain/entities/dashboard.entity';
import { DashboardRepositoryPort } from '../ports/dashboard-repository.port';
import { SalesRepositoryPort } from '../ports/sales-repository.port';
import { RevenueRepositoryPort } from '../ports/revenue-repository.port';
import { GeographyRepositoryPort } from '../ports/geography-repository.port';
import { ConversionRepositoryPort } from '../ports/conversion-repository.port';
import { RetentionRepositoryPort } from '../ports/retention-repository.port';
import { CohortRepositoryPort } from '../ports/cohort-repository.port';
import { PaymentMethodsRepositoryPort } from '../ports/payment-methods-repository.port';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { RefundsRepositoryPort } from '../ports/refunds-repository.port';
import { MarketingChannelsRepositoryPort } from '../ports/marketing-channels-repository.port';

export class LoadDashboardUseCase {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryPort,
    private readonly salesRepository: SalesRepositoryPort,
    private readonly revenueRepository: RevenueRepositoryPort,
    private readonly geographyRepository: GeographyRepositoryPort,
    private readonly conversionRepository: ConversionRepositoryPort,
    private readonly retentionRepository: RetentionRepositoryPort,
    private readonly cohortRepository: CohortRepositoryPort,
    private readonly paymentMethodsRepository: PaymentMethodsRepositoryPort,
    private readonly transactionsRepository: TransactionsRepositoryPort,
    private readonly refundsRepository: RefundsRepositoryPort,
    private readonly marketingChannelsRepository: MarketingChannelsRepositoryPort
  ) {}

  async execute(userId: string): Promise<Dashboard> {
    // Загружаем все данные параллельно
    const [
      salesSummary,
      revenueSummary,
      geographySummary,
      conversionSummary,
      retentionSummary,
      cohortSummary,
      paymentMethodsSummary,
      transactionsSummary,
      refundsSummary,
      marketingChannelsSummary
    ] = await Promise.all([
      this.salesRepository.getSalesSummary(),
      this.revenueRepository.getRevenueSummary(),
      this.geographyRepository.getGeographySummary(),
      this.conversionRepository.getConversionSummary(),
      this.retentionRepository.getRetentionSummary(),
      this.cohortRepository.getCohortSummary(),
      this.paymentMethodsRepository.getPaymentMethodsSummary(),
      this.transactionsRepository.getTransactionsSummary(),
      this.refundsRepository.getRefundsSummary(),
      this.marketingChannelsRepository.getMarketingChannelsSummary()
    ]);
    
    // Создаем дашборд с помощью репозитория
    return new Dashboard(
      salesSummary,
      revenueSummary,
      geographySummary,
      conversionSummary,
      retentionSummary,
      cohortSummary,
      paymentMethodsSummary,
      transactionsSummary,
      refundsSummary,
      marketingChannelsSummary
    );
  }
}
