import { TYPES } from './realtime-dashboard.types';
import { env } from '../../../../../../env';

// Import repositories
import { DashboardRepository } from '../repositories/dashboard.repository';
import { FilterPresetRepository } from '../repositories/filter-preset.repository';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { SupabasePurchaseRepository } from '../repositories/supabase-purchase.repository';

// Import use cases
import { LoadDashboardUseCase } from '../../application/use-cases/load-dashboard.use-case';
import { SubscribeRealtimeUseCase } from '../../application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '../../application/use-cases/unsubscribe-realtime.use-case';
import { ApplySettingsUseCase } from '../../application/use-cases/apply-settings.use-case';
import { ResetSettingsUseCase } from '../../application/use-cases/reset-settings.use-case';
import { LoadSettingsUseCase } from '../../application/use-cases/load-settings.use-case';
import { LoadPresetsUseCase } from '../../application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '../../application/use-cases/save-preset.use-case';
import { LoadRecentPurchasesUseCase } from '../../application/use-cases/load-recent-purchases.use-case';

// Import presenters
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';

// Import repository ports
import { DashboardRepositoryPort } from '../../application/ports/dashboard-repository.port';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsRepositoryPort } from '../../application/ports/analytics-repository.port';
import { FilterPresetRepositoryPort } from '../../application/ports/filter-preset-repository.port';
import { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import { container } from '@/infrastructure/bootstrap/container';

// Repository bindings
container.bind<DashboardRepositoryPort>(TYPES.DashboardRepository).to(DashboardRepository);
container.bind<AnalyticsRepositoryPort>(TYPES.AnalyticsRepository).to(AnalyticsRepository);
container.bind<FilterPresetRepositoryPort>(TYPES.FilterPresetRepository).to(FilterPresetRepository);
// Purchase Repository binding - use Supabase for purchase data only
if (env.NEXT_PUBLIC_USE_SUPABASE_PURCHASE === 'true' && 
    env.NEXT_PUBLIC_SUPABASE_URL && 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    env.NEXT_PUBLIC_SUPABASE_URL !== 'SET' && 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'SET') {
  container.bind<PurchaseRepositoryPort>(TYPES.PurchaseRepository).to(SupabasePurchaseRepository);
} else {
  container.bind<PurchaseRepositoryPort>(TYPES.PurchaseRepository).to(PurchaseRepository);
}

// Use case bindings
container.bind(TYPES.LoadDashboardUseCase).to(LoadDashboardUseCase);
container.bind(TYPES.SubscribeRealtimeUseCase).to(SubscribeRealtimeUseCase);
container.bind(TYPES.UnsubscribeRealtimeUseCase).to(UnsubscribeRealtimeUseCase);
container.bind(TYPES.ApplySettingsUseCase).to(ApplySettingsUseCase);
container.bind(TYPES.ResetSettingsUseCase).to(ResetSettingsUseCase);
container.bind(TYPES.LoadSettingsUseCase).to(LoadSettingsUseCase);
container.bind(TYPES.LoadPresetsUseCase).to(LoadPresetsUseCase);
container.bind(TYPES.SavePresetUseCase).to(SavePresetUseCase);
container.bind(TYPES.LoadRecentPurchasesUseCase).to(LoadRecentPurchasesUseCase);
// Presenter bindings
container.bind(TYPES.DashboardPresenter).to(DashboardPresenter);
