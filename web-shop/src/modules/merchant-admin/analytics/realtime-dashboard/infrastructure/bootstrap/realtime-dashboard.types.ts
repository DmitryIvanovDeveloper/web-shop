// Realtime Dashboard Module TYPES
export const TYPES = {
  // Repositories
  DashboardRepository: Symbol.for('DashboardRepository'),
  SalesRepository: Symbol.for('SalesRepository'),
  RevenueRepository: Symbol.for('RevenueRepository'),
  GeographyRepository: Symbol.for('GeographyRepository'),
  ConversionRepository: Symbol.for('ConversionRepository'),
  RetentionRepository: Symbol.for('RetentionRepository'),
  CohortRepository: Symbol.for('CohortRepository'),
  PaymentMethodsRepository: Symbol.for('PaymentMethodsRepository'),
  TransactionsRepository: Symbol.for('TransactionsRepository'),
  RefundsRepository: Symbol.for('RefundsRepository'),
  MarketingChannelsRepository: Symbol.for('MarketingChannelsRepository'),
  FilterPresetRepository: Symbol.for('FilterPresetRepository'),
  PurchaseRepository: Symbol.for('PurchaseRepository'),
  
  // Use Cases
  LoadDashboardUseCase: Symbol.for('LoadDashboardUseCase'),
  SubscribeRealtimeUseCase: Symbol.for('SubscribeRealtimeUseCase'),
  UnsubscribeRealtimeUseCase: Symbol.for('UnsubscribeRealtimeUseCase'),
  ApplySettingsUseCase: Symbol.for('ApplySettingsUseCase'),
  ResetSettingsUseCase: Symbol.for('ResetSettingsUseCase'),
  LoadSettingsUseCase: Symbol.for('LoadSettingsUseCase'),
  LoadPresetsUseCase: Symbol.for('LoadPresetsUseCase'),
  SavePresetUseCase: Symbol.for('SavePresetUseCase'),
  LoadRecentPurchasesUseCase: Symbol.for('LoadRecentPurchasesUseCase'),
  
  // Presenters
  DashboardPresenter: Symbol.for('DashboardPresenter')
} as const;
