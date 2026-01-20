import { injectable, inject } from 'inversify';
import { Dashboard } from '../../domain/entities/dashboard.entity';
import type { DashboardRepositoryPort } from '../ports/dashboard-repository.port';
import type { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';
import type { PurchaseRepositoryPort } from '../ports/purchase-repository.port';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';

@injectable()
export class LoadDashboardUseCase {
  constructor(
    @inject(TYPES.AnalyticsRepository)
    private readonly analyticsRepository: AnalyticsRepositoryPort,
    @inject(TYPES.PurchaseRepository)
    private readonly purchaseRepository: PurchaseRepositoryPort
  ) {}

  async execute(userId: string): Promise<Dashboard> {
    
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
      this.analyticsRepository.getSalesSummary(),
      this.analyticsRepository.getRevenueSummary(),
      this.analyticsRepository.getGeographySummary(),
      this.analyticsRepository.getConversionSummary(),
      this.analyticsRepository.getRetentionSummary(),
      this.analyticsRepository.getCohortSummary(),
      this.analyticsRepository.getPaymentMethodsSummary(),
      this.analyticsRepository.getTransactionsSummary(),
      this.analyticsRepository.getRefundsSummary(),
      this.analyticsRepository.getMarketingChannelsSummary(),
      this.purchaseRepository.getPurchaseSummary()
    ]);

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
