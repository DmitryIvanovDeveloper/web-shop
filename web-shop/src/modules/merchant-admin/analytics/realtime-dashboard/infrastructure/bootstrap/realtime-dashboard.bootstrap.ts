import { Container } from '../../../../../../infrastructure/bootstrap/container';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { SalesRepository } from '../repositories/sales.repository';
import { RevenueRepository } from '../repositories/revenue.repository';
import { GeographyRepository } from '../repositories/geography.repository';
import { ConversionRepository } from '../repositories/conversion.repository';
import { FilterPresetRepository } from '../repositories/filter-preset.repository';
import { LoadDashboardUseCase } from '../../application/use-cases/load-dashboard.use-case';
import { SubscribeRealtimeUseCase } from '../../application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '../../application/use-cases/unsubscribe-realtime.use-case';
import { ApplySettingsUseCase } from '../../application/use-cases/apply-settings.use-case';
import { ResetSettingsUseCase } from '../../application/use-cases/reset-settings.use-case';
import { LoadSettingsUseCase } from '../../application/use-cases/load-settings.use-case';
import { LoadPresetsUseCase } from '../../application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '../../application/use-cases/save-preset.use-case';

export class RealtimeDashboardBootstrap {
  static initialize(): void {
    const container = Container.getInstance();
    
    // Register repositories
    container.register('realtimeDashboard.dashboardRepository', new DashboardRepository());
    container.register('realtimeDashboard.salesRepository', new SalesRepository(container.getHttpClient()));
    container.register('realtimeDashboard.revenueRepository', new RevenueRepository(container.getHttpClient()));
    container.register('realtimeDashboard.geographyRepository', new GeographyRepository(container.getHttpClient()));
    container.register('realtimeDashboard.conversionRepository', new ConversionRepository(container.getHttpClient()));
    container.register('realtimeDashboard.filterPresetRepository', new FilterPresetRepository(container.getHttpClient()));
    
    // Register use cases
    container.register('realtimeDashboard.loadDashboardUseCase', new LoadDashboardUseCase(
      container.get('realtimeDashboard.dashboardRepository'),
      container.get('realtimeDashboard.salesRepository'),
      container.get('realtimeDashboard.revenueRepository'),
      container.get('realtimeDashboard.geographyRepository'),
      container.get('realtimeDashboard.conversionRepository')
    ));
    
    container.register('realtimeDashboard.subscribeRealtimeUseCase', new SubscribeRealtimeUseCase(
      container.getRealtimeClient(),
      container.getLogger()
    ));
    
    container.register('realtimeDashboard.unsubscribeRealtimeUseCase', new UnsubscribeRealtimeUseCase(
      container.getRealtimeClient(),
      container.getLogger()
    ));
    
    container.register('realtimeDashboard.applySettingsUseCase', new ApplySettingsUseCase());
    container.register('realtimeDashboard.resetSettingsUseCase', new ResetSettingsUseCase());
    container.register('realtimeDashboard.loadSettingsUseCase', new LoadSettingsUseCase());
    
    container.register('realtimeDashboard.loadPresetsUseCase', new LoadPresetsUseCase(
      container.get('realtimeDashboard.filterPresetRepository')
    ));
    
    container.register('realtimeDashboard.savePresetUseCase', new SavePresetUseCase(
      container.get('realtimeDashboard.filterPresetRepository')
    ));
  }
}
