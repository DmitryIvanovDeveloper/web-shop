// Value Objects
export { Period, type GranularityType, type PeriodPreset } from './value-objects/period.value-object';
export { ComparisonPeriod, type ComparisonDirection } from './value-objects/comparison-period.value-object';
export { MetricTrend, type TrendDataPoint } from './value-objects/metric-trend.value-object';
export { DashboardFilters, type PlatformType } from './value-objects/dashboard-filters.value-object';
export { SalesSummary } from './value-objects/sales-summary.value-object';
export { RevenueSummary } from './value-objects/revenue-summary.value-object';

// Domain Errors
export {
  DashboardDomainError,
  InvalidPeriodError,
  DataUnavailableError,
  InvalidFilterError,
  NetworkError,
  TimeoutError
} from './errors/dashboard.error';
