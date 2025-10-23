import { TYPES } from './realtime-dashboard.types';
import { env } from '../../../../../../env';

// Import repositories
import { DashboardRepository } from '../repositories/dashboard.repository';
import { SalesRepository } from '../repositories/sales.repository';
import { RevenueRepository } from '../repositories/revenue.repository';
import { GeographyRepository } from '../repositories/geography.repository';
import { ConversionRepository } from '../repositories/conversion.repository';
import { RetentionRepository } from '../repositories/retention.repository';
import { CohortRepository } from '../repositories/cohort.repository';
import { PaymentMethodsRepository } from '../repositories/payment-methods.repository';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { RefundsRepository } from '../repositories/refunds.repository';
import { MarketingChannelsRepository } from '../repositories/marketing-channels.repository';
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
import { SalesRepositoryPort } from '../../application/ports/sales-repository.port';
import { RevenueRepositoryPort } from '../../application/ports/revenue-repository.port';
import { GeographyRepositoryPort } from '../../application/ports/geography-repository.port';
import { ConversionRepositoryPort } from '../../application/ports/conversion-repository.port';
import { RetentionRepositoryPort } from '../../application/ports/retention-repository.port';
import { CohortRepositoryPort } from '../../application/ports/cohort-repository.port';
import { PaymentMethodsRepositoryPort } from '../../application/ports/payment-methods-repository.port';
import { TransactionsRepositoryPort } from '../../application/ports/transactions-repository.port';
import { RefundsRepositoryPort } from '../../application/ports/refunds-repository.port';
import { MarketingChannelsRepositoryPort } from '../../application/ports/marketing-channels-repository.port';
import { FilterPresetRepositoryPort } from '../../application/ports/filter-preset-repository.port';
import { PurchaseRepositoryPort } from '../../application/ports/purchase-repository.port';
import { container } from '@/infrastructure/bootstrap/container';

// Repository bindings
container.bind<DashboardRepositoryPort>(TYPES.DashboardRepository).to(DashboardRepository);
container.bind<SalesRepositoryPort>(TYPES.SalesRepository).to(SalesRepository);
container.bind<RevenueRepositoryPort>(TYPES.RevenueRepository).to(RevenueRepository);
container.bind<GeographyRepositoryPort>(TYPES.GeographyRepository).to(GeographyRepository);
container.bind<ConversionRepositoryPort>(TYPES.ConversionRepository).to(ConversionRepository);
container.bind<RetentionRepositoryPort>(TYPES.RetentionRepository).to(RetentionRepository);
container.bind<CohortRepositoryPort>(TYPES.CohortRepository).to(CohortRepository);
container.bind<PaymentMethodsRepositoryPort>(TYPES.PaymentMethodsRepository).to(PaymentMethodsRepository);
container.bind<TransactionsRepositoryPort>(TYPES.TransactionsRepository).to(TransactionsRepository);
container.bind<RefundsRepositoryPort>(TYPES.RefundsRepository).to(RefundsRepository);
container.bind<MarketingChannelsRepositoryPort>(TYPES.MarketingChannelsRepository).to(MarketingChannelsRepository);
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
