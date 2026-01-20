
export const TYPES = {
  
  DashboardDomainError: Symbol.for('DashboardDomainError'),

  PeriodComparisonService: Symbol.for('PeriodComparisonService'),
  TrendCalculationService: Symbol.for('TrendCalculationService'),

  AnalyticsRepository: Symbol.for('AnalyticsRepository'),
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
