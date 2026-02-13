
export const TYPES = {

  DashboardRepository: Symbol.for('DashboardRepository'),
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
  FilterPresetRepository: Symbol.for('FilterPresetRepository'),
  PurchaseRepository: Symbol.for('PurchaseRepository'),
  PeriodComparisonService: Symbol.for('PeriodComparisonService'),

  LoadDashboardUseCase: Symbol.for('LoadDashboardUseCase'),
  LoadSalesUseCase: Symbol.for('LoadSalesUseCase'),
  LoadRevenueUseCase: Symbol.for('LoadRevenueUseCase'),
  SubscribeRealtimeUseCase: Symbol.for('SubscribeRealtimeUseCase'),
  UnsubscribeRealtimeUseCase: Symbol.for('UnsubscribeRealtimeUseCase'),
  ApplySettingsUseCase: Symbol.for('ApplySettingsUseCase'),
  ResetSettingsUseCase: Symbol.for('ResetSettingsUseCase'),
  LoadSettingsUseCase: Symbol.for('LoadSettingsUseCase'),
  LoadPresetsUseCase: Symbol.for('LoadPresetsUseCase'),
  SavePresetUseCase: Symbol.for('SavePresetUseCase'),
  LoadRecentPurchasesUseCase: Symbol.for('LoadRecentPurchasesUseCase'),

  DashboardPresenter: Symbol.for('DashboardPresenter')
} as const;
