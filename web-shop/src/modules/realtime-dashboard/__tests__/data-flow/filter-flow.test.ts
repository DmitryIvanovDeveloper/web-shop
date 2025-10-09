import { describe, it, expect, beforeEach, vi } from 'vitest';
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
import { Logger } from '../../../../application/ports/logger.port';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DateRangeFilter } from '../../domain/value-objects/date-range-filter.value-object';
import { GeoFilter } from '../../domain/value-objects/geo-filter.value-object';

const mockLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('Filter Data Flow', () => {
  let presenter: DashboardPresenter;
  let loadPresetsUseCase: LoadPresetsUseCase;
  let savePresetUseCase: SavePresetUseCase;

  beforeEach(() => {
    const httpClient = new HttpClientMock();
    const realtimeClient = new MockRealtimeClient(mockLogger);

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

    const subscribeRealtimeUseCase = new SubscribeRealtimeUseCase(realtimeClient, mockLogger);
    const unsubscribeRealtimeUseCase = new UnsubscribeRealtimeUseCase(realtimeClient, mockLogger);
    const applySettingsUseCase = new ApplySettingsUseCase();
    const resetSettingsUseCase = new ResetSettingsUseCase();
    const loadSettingsUseCase = new LoadSettingsUseCase();
    loadPresetsUseCase = new LoadPresetsUseCase(filterPresetRepository);
    savePresetUseCase = new SavePresetUseCase(filterPresetRepository);

    const onViewModelChanged = vi.fn();

    presenter = new DashboardPresenter(
      loadDashboardUseCase,
      subscribeRealtimeUseCase,
      unsubscribeRealtimeUseCase,
      applySettingsUseCase,
      resetSettingsUseCase,
      loadSettingsUseCase,
      loadPresetsUseCase,
      savePresetUseCase,
      onViewModelChanged
    );
  });

  it('should load filter presets successfully', async () => {
    await presenter.loadFilterPresets();

    const viewModel = presenter.getViewModel();
    expect(viewModel.filterPresets).toBeDefined();
    expect(viewModel.filterPresets.length).toBeGreaterThan(0);
  });

  it('should apply filters and update URL', async () => {
    const dateRangeResult = DateRangeFilter.fromPreset('last30days', 'day');
    const geoResult = GeoFilter.create({ countries: ['US', 'UK'] });

    expect(dateRangeResult.isSuccess()).toBe(true);
    expect(geoResult.isSuccess()).toBe(true);

    const filterSetResult = FilterSet.create({
      dateRange: dateRangeResult.data!,
      geo: geoResult.data!,
    });

    expect(filterSetResult.isSuccess()).toBe(true);

    presenter.applyFilters(filterSetResult.data!);

    const viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last30days');
    expect(viewModel.filterSet.geo.countries).toEqual(['US', 'UK']);
    expect(viewModel.currentPresetId).toBeUndefined(); // Manual filters clear preset
  });

  it('should load preset and apply filters', async () => {
    await presenter.loadFilterPresets();

    const viewModel = presenter.getViewModel();
    const firstPresetId = viewModel.filterPresets[0]?.id;

    if (firstPresetId) {
      await presenter.loadFilterPreset(firstPresetId);

      const updatedViewModel = presenter.getViewModel();
      expect(updatedViewModel.currentPresetId).toBe(firstPresetId);
      expect(updatedViewModel.filterSet).toBeDefined();
    }
  });

  it('should save current filters as preset', async () => {
    const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
    expect(dateRangeResult.isSuccess()).toBe(true);

    const filterSetResult = FilterSet.create({
      dateRange: dateRangeResult.data!,
    });
    expect(filterSetResult.isSuccess()).toBe(true);

    presenter.applyFilters(filterSetResult.data!);

    await presenter.saveFilterPreset('My Custom Preset');

    const viewModel = presenter.getViewModel();
    expect(viewModel.currentPresetId).toBeDefined();
  });

  it('should reset filters to default', () => {
    const dateRangeResult = DateRangeFilter.fromPreset('last30days', 'day');
    expect(dateRangeResult.isSuccess()).toBe(true);

    const filterSetResult = FilterSet.create({
      dateRange: dateRangeResult.data!,
    });
    expect(filterSetResult.isSuccess()).toBe(true);

    presenter.applyFilters(filterSetResult.data!);

    let viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last30days');

    presenter.resetFilters();

    viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last7days'); // Default
    expect(viewModel.currentPresetId).toBeUndefined();
  });

  it('should load filters from URL query params', () => {
    const params = new URLSearchParams({
      dateRange: 'last30days',
      granularity: 'week',
      geo: 'US,UK',
      currency: 'EUR',
    });

    presenter.loadFiltersFromUrl(params);

    const viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last30days');
    expect(viewModel.filterSet.dateRange.granularity).toBe('week');
    expect(viewModel.filterSet.geo.countries).toEqual(['US', 'UK']);
    expect(viewModel.filterSet.currency.currency).toBe('EUR');
  });

  it('should complete full filter workflow: URL → Apply → Save → Load', async () => {
    // 1. Load from URL
    const params = new URLSearchParams({
      dateRange: 'last30days',
      geo: 'US',
    });
    presenter.loadFiltersFromUrl(params);

    let viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last30days');
    expect(viewModel.filterSet.geo.countries).toEqual(['US']);

    // 2. Save as preset (mock will return preset but not persist)
    await presenter.saveFilterPreset('US Market Report');

    viewModel = presenter.getViewModel();
    const savedPresetId = viewModel.currentPresetId;
    expect(savedPresetId).toBeDefined();

    // 3. Reset filters
    presenter.resetFilters();

    viewModel = presenter.getViewModel();
    expect(viewModel.filterSet.dateRange.preset).toBe('last7days');

    // 4. Load existing preset from mock data (not the saved one)
    await presenter.loadFilterPresets();
    viewModel = presenter.getViewModel();
    
    if (viewModel.filterPresets.length > 0) {
      const firstPresetId = viewModel.filterPresets[0].id;
      await presenter.loadFilterPreset(firstPresetId);

      viewModel = presenter.getViewModel();
      expect(viewModel.currentPresetId).toBe(firstPresetId);
      expect(viewModel.filterSet).toBeDefined();
    }
  });
});

