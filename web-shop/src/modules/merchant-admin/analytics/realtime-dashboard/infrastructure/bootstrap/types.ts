// Domain Types
export const TYPES = {
  // Domain
  DashboardDomainError: Symbol.for('DashboardDomainError'),

  // Services
  PeriodComparisonService: Symbol.for('PeriodComparisonService'),
  TrendCalculationService: Symbol.for('TrendCalculationService'),

  // Repositories
  AnalyticsRepository: Symbol.for('AnalyticsRepository'),
  PaymentAnalyticsRepository: Symbol.for('PaymentAnalyticsRepository'),
  PlatformAnalyticsRepository: Symbol.for('PlatformAnalyticsRepository'),
  ProductAnalyticsRepository: Symbol.for('ProductAnalyticsRepository'),

  // Use Cases
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

  // Services
  ExportService: Symbol.for('ExportService'),

  // Presenters
  DashboardPresenter: Symbol.for('DashboardPresenter'),

  // External Dependencies
  HttpClient: Symbol.for('HttpClient'),
  Logger: Symbol.for('Logger'),
} as const;

// Re-export for convenience
export type DashboardTypes = typeof TYPES;
