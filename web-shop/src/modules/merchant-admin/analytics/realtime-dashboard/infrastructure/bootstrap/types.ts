
export const TYPES = {
  
  DashboardDomainError: Symbol.for('DashboardDomainError'),

  PeriodComparisonService: Symbol.for('PeriodComparisonService'),
  TrendCalculationService: Symbol.for('TrendCalculationService'),

  AnalyticsRepository: Symbol.for('AnalyticsRepository'),
  SalesRepository: Symbol.for('SalesRepository'),
  RevenueRepository: Symbol.for('RevenueRepository'),
  GeographyRepository: Symbol.for('GeographyRepository'),
  ConversionRepository: Symbol.for('ConversionRepository'),
  TransactionsRepository: Symbol.for('TransactionsRepository'),
  RetentionRepository: Symbol.for('RetentionRepository'),
  CohortRepository: Symbol.for('CohortRepository'),
  PaymentMethodsRepository: Symbol.for('PaymentMethodsRepository'),
  RefundsRepository: Symbol.for('RefundsRepository'),
  MarketingChannelsRepository: Symbol.for('MarketingChannelsRepository'),
  PaymentAnalyticsRepository: Symbol.for('PaymentAnalyticsRepository'),
  PlatformAnalyticsRepository: Symbol.for('PlatformAnalyticsRepository'),
  ProductAnalyticsRepository: Symbol.for('ProductAnalyticsRepository'),

  LoadSalesUseCase: Symbol.for('LoadSalesUseCase'),
  LoadRevenueUseCase: Symbol.for('LoadRevenueUseCase'),
  LoadGeographyUseCase: Symbol.for('LoadGeographyUseCase'),
  LoadConversionUseCase: Symbol.for('LoadConversionUseCase'),
  LoadPaymentSuccessUseCase: Symbol.for('LoadPaymentSuccessUseCase'),
  LoadPlatformMetricsUseCase: Symbol.for('LoadPlatformMetricsUseCase'),
  LoadProductAnalyticsUseCase: Symbol.for('LoadProductAnalyticsUseCase'),
  ApplyDateRangeUseCase: Symbol.for('ApplyDateRangeUseCase'),
  MonitorPaymentAlertsUseCase: Symbol.for('MonitorPaymentAlertsUseCase'),
  ExportDashboardUseCase: Symbol.for('ExportDashboardUseCase'),

  ExportService: Symbol.for('ExportService'),

  DashboardPresenter: Symbol.for('DashboardPresenter'),

  HttpClient: Symbol.for('HttpClient'),
  Logger: Symbol.for('Logger'),
} as const;

export type DashboardTypes = typeof TYPES;
