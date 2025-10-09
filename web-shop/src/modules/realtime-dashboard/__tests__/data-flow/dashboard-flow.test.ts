import { describe, it, expect } from 'vitest';
import { DashboardPresenter } from '../../interface-adapters/presenters/dashboard.presenter';
import { LoadDashboardUseCase } from '../../application/use-cases/load-dashboard.use-case';
import { SubscribeRealtimeUseCase } from '../../application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '../../application/use-cases/unsubscribe-realtime.use-case';
import { ApplySettingsUseCase } from '../../application/use-cases/apply-settings.use-case';
import { ResetSettingsUseCase } from '../../application/use-cases/reset-settings.use-case';
import { LoadSettingsUseCase } from '../../application/use-cases/load-settings.use-case';
import { LoadPresetsUseCase } from '../../application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '../../application/use-cases/save-preset.use-case';
import { DashboardRepository } from '../../infrastructure/repositories/dashboard.repository';
import { SalesRepository } from '../../infrastructure/repositories/sales.repository';
import { RevenueRepository } from '../../infrastructure/repositories/revenue.repository';
import { GeographyRepository } from '../../infrastructure/repositories/geography.repository';
import { ConversionRepository } from '../../infrastructure/repositories/conversion.repository';
import { FilterPresetRepository } from '../../infrastructure/repositories/filter-preset.repository';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { MockRealtimeClient } from '../../../../infrastructure/realtime/mock-realtime-client';
import { ConsoleLogger } from '../../../../infrastructure/logging/console-logger';

describe('Dashboard Data Flow', () => {
  it('should complete full data flow from UI to Domain and back', async () => {
    // Arrange
    const httpClient = new HttpClientMock('/mocks');
    const logger = new ConsoleLogger();
    const realtimeClient = new MockRealtimeClient(logger);
    
    const dashboardRepository = new DashboardRepository();
    const salesRepository = new SalesRepository(httpClient);
    const revenueRepository = new RevenueRepository(httpClient);
    const geographyRepository = new GeographyRepository(httpClient);
    const conversionRepository = new ConversionRepository(httpClient);
    const filterPresetRepository = new FilterPresetRepository(httpClient);
    
    const loadDashboardUseCase = new LoadDashboardUseCase(
      dashboardRepository,
      salesRepository,
      revenueRepository,
      geographyRepository,
      conversionRepository
    );
    const subscribeRealtimeUseCase = new SubscribeRealtimeUseCase(realtimeClient, logger);
    const unsubscribeRealtimeUseCase = new UnsubscribeRealtimeUseCase(realtimeClient, logger);
    const applySettingsUseCase = new ApplySettingsUseCase();
    const resetSettingsUseCase = new ResetSettingsUseCase();
    const loadSettingsUseCase = new LoadSettingsUseCase();
    const loadPresetsUseCase = new LoadPresetsUseCase(filterPresetRepository);
    const savePresetUseCase = new SavePresetUseCase(filterPresetRepository);
    
    let viewModelChanged = false;
    const presenter = new DashboardPresenter(
      loadDashboardUseCase,
      subscribeRealtimeUseCase,
      unsubscribeRealtimeUseCase,
      applySettingsUseCase,
      resetSettingsUseCase,
      loadSettingsUseCase,
      loadPresetsUseCase,
      savePresetUseCase,
      () => { viewModelChanged = true; }
    );

    // Act - simulate user action
    await presenter.loadDashboard('test-user');

    // Assert - verify complete data flow
    const viewModel = presenter.getViewModel();
    
    // 1. Loading state should be false after completion
    expect(viewModel.isLoading).toBe(false);
    
    // 2. No error should occur
    expect(viewModel.errorMessage).toBeNull();
    
    // 3. Dashboard should be loaded with sales data
    expect(viewModel.dashboard).toBeDefined();
    expect(viewModel.dashboard?.salesSummary).toBeDefined();
    expect(viewModel.dashboard?.salesSummary?.totalSales).toBe(125430);
    expect(viewModel.dashboard?.salesSummary?.transactions).toBe(1247);
    expect(viewModel.dashboard?.salesSummary?.arpu).toBe(100.58);
    
    // 4. Trend data should be properly formatted
    expect(viewModel.dashboard?.salesSummary?.trend).toHaveLength(8);
    expect(viewModel.dashboard?.salesSummary?.trend[0].timestamp).toBeInstanceOf(Date);
    
    // 5. ViewModel should have been updated
    expect(viewModelChanged).toBe(true);
  });

  it('should handle error in data flow gracefully', async () => {
    // Arrange - use invalid HTTP client to cause error
    const httpClient = new HttpClientMock('/invalid-path');
    const logger = new ConsoleLogger();
    const realtimeClient = new MockRealtimeClient(logger);
    
    const dashboardRepository = new DashboardRepository();
    const salesRepository = new SalesRepository(httpClient);
    const revenueRepository = new RevenueRepository(httpClient);
    const geographyRepository = new GeographyRepository(httpClient);
    const conversionRepository = new ConversionRepository(httpClient);
    const filterPresetRepository = new FilterPresetRepository(httpClient);
    
    const loadDashboardUseCase = new LoadDashboardUseCase(
      dashboardRepository,
      salesRepository,
      revenueRepository,
      geographyRepository,
      conversionRepository
    );
    const subscribeRealtimeUseCase = new SubscribeRealtimeUseCase(realtimeClient, logger);
    const unsubscribeRealtimeUseCase = new UnsubscribeRealtimeUseCase(realtimeClient, logger);
    const applySettingsUseCase = new ApplySettingsUseCase();
    const resetSettingsUseCase = new ResetSettingsUseCase();
    const loadSettingsUseCase = new LoadSettingsUseCase();
    const loadPresetsUseCase = new LoadPresetsUseCase(filterPresetRepository);
    const savePresetUseCase = new SavePresetUseCase(filterPresetRepository);
    
    const presenter = new DashboardPresenter(
      loadDashboardUseCase,
      subscribeRealtimeUseCase,
      unsubscribeRealtimeUseCase,
      applySettingsUseCase,
      resetSettingsUseCase,
      loadSettingsUseCase,
      loadPresetsUseCase,
      savePresetUseCase,
      () => {}
    );

    // Act
    await presenter.loadDashboard('test-user');

    // Assert - error should be handled gracefully
    const viewModel = presenter.getViewModel();
    expect(viewModel.isLoading).toBe(false);
    expect(viewModel.errorMessage).toBeDefined();
    expect(viewModel.dashboard).toBeNull();
  });
});
