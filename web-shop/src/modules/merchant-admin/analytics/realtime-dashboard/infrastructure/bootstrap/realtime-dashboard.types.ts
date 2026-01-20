
export const TYPES = {
  
  DashboardRepository: Symbol.for('DashboardRepository'),
  AnalyticsRepository: Symbol.for('AnalyticsRepository'),
  FilterPresetRepository: Symbol.for('FilterPresetRepository'),
  PurchaseRepository: Symbol.for('PurchaseRepository'),

  LoadDashboardUseCase: Symbol.for('LoadDashboardUseCase'),
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
