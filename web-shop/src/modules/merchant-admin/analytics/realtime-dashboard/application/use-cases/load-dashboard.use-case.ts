import { injectable, inject } from 'inversify';
import { Dashboard } from '../../domain/entities/dashboard.entity';
import type { DashboardRepositoryPort } from '../ports/dashboard-repository.port';
import type { SalesRepositoryPort } from '../ports/sales-repository.port';
import type { RevenueRepositoryPort } from '../ports/revenue-repository.port';
import type { GeographyRepositoryPort } from '../ports/geography-repository.port';
import type { ConversionRepositoryPort } from '../ports/conversion-repository.port';
import type { RetentionRepositoryPort } from '../ports/retention-repository.port';
import type { CohortRepositoryPort } from '../ports/cohort-repository.port';
import type { PaymentMethodsRepositoryPort } from '../ports/payment-methods-repository.port';
import type { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import type { RefundsRepositoryPort } from '../ports/refunds-repository.port';
import type { MarketingChannelsRepositoryPort } from '../ports/marketing-channels-repository.port';
import type { PurchaseRepositoryPort } from '../ports/purchase-repository.port';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';

@injectable()
export class LoadDashboardUseCase {
  constructor(
    @inject(TYPES.DashboardRepository)
    private readonly dashboardRepository: DashboardRepositoryPort,
    @inject(TYPES.SalesRepository)
    private readonly salesRepository: SalesRepositoryPort,
    @inject(TYPES.RevenueRepository)
    private readonly revenueRepository: RevenueRepositoryPort,
    @inject(TYPES.GeographyRepository)
    private readonly geographyRepository: GeographyRepositoryPort,
    @inject(TYPES.ConversionRepository)
    private readonly conversionRepository: ConversionRepositoryPort,
    @inject(TYPES.RetentionRepository)
    private readonly retentionRepository: RetentionRepositoryPort,
    @inject(TYPES.CohortRepository)
    private readonly cohortRepository: CohortRepositoryPort,
    @inject(TYPES.PaymentMethodsRepository)
    private readonly paymentMethodsRepository: PaymentMethodsRepositoryPort,
    @inject(TYPES.TransactionsRepository)
    private readonly transactionsRepository: TransactionsRepositoryPort,
    @inject(TYPES.RefundsRepository)
    private readonly refundsRepository: RefundsRepositoryPort,
    @inject(TYPES.MarketingChannelsRepository)
    private readonly marketingChannelsRepository: MarketingChannelsRepositoryPort,
    @inject(TYPES.PurchaseRepository)
    private readonly purchaseRepository: PurchaseRepositoryPort
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
      marketingChannelsSummary,
      purchaseSummary
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
      this.marketingChannelsRepository.getMarketingChannelsSummary(),
      this.purchaseRepository.getPurchaseSummary()
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
      marketingChannelsSummary,
      purchaseSummary
    );
  }
}
