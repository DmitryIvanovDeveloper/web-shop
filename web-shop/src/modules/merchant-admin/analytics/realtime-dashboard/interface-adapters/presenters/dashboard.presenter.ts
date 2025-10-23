import { injectable, inject } from 'inversify';
import { Dashboard } from '../../domain/entities/dashboard.entity';
import type { LoadDashboardUseCase } from '../../application/use-cases/load-dashboard.use-case';
import type { SubscribeRealtimeUseCase } from '../../application/use-cases/subscribe-realtime.use-case';
import type { UnsubscribeRealtimeUseCase } from '../../application/use-cases/unsubscribe-realtime.use-case';
import type { ApplySettingsUseCase } from '../../application/use-cases/apply-settings.use-case';
import type { ResetSettingsUseCase } from '../../application/use-cases/reset-settings.use-case';
import type { LoadSettingsUseCase } from '../../application/use-cases/load-settings.use-case';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import type { LoadPresetsUseCase } from '../../application/use-cases/load-presets.use-case';
import type { SavePresetUseCase } from '../../application/use-cases/save-preset.use-case';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';
import type { LoadRecentPurchasesUseCase } from '../../application/use-cases/load-recent-purchases.use-case';
import type { PurchaseRow } from '../../application/ports/purchase-repository.port';

export interface DashboardViewModel {
  dashboard: Dashboard | null;
  isLoading: boolean;
  errorMessage: string | null;
  realtimeConnected: boolean;
  realtimePaused: boolean;
  settings: DashboardSettings;
  settingsPreview: DashboardSettings | null;
  filterSet: FilterSet;
  filterPresets: FilterPreset[];
  currentPresetId?: string;
}

@injectable()
export class DashboardPresenter {
  private viewModel: DashboardViewModel = {
    dashboard: null,
    isLoading: false,
    errorMessage: null,
    realtimeConnected: false,
    realtimePaused: false,
    settings: DashboardSettings.createDefault(),
    settingsPreview: null,
    filterSet: FilterSet.createDefault(),
    filterPresets: [],
    currentPresetId: undefined
  };

  private onViewModelChanged: () => void = () => {}; // Default empty callback
  private realtimeChannels = [
    'dashboard.sales',
    'dashboard.revenue',
    'dashboard.geography',
    'dashboard.conversion'
  ];

  constructor(
    @inject(TYPES.LoadDashboardUseCase)
    private readonly loadDashboardUseCase: LoadDashboardUseCase,
    @inject(TYPES.SubscribeRealtimeUseCase)
    private readonly subscribeRealtimeUseCase: SubscribeRealtimeUseCase,
    @inject(TYPES.UnsubscribeRealtimeUseCase)
    private readonly unsubscribeRealtimeUseCase: UnsubscribeRealtimeUseCase,
    @inject(TYPES.ApplySettingsUseCase)
    private readonly applySettingsUseCase: ApplySettingsUseCase,
    @inject(TYPES.ResetSettingsUseCase)
    private readonly resetSettingsUseCase: ResetSettingsUseCase,
    @inject(TYPES.LoadSettingsUseCase)
    private readonly loadSettingsUseCase: LoadSettingsUseCase,
    @inject(TYPES.LoadPresetsUseCase)
    private readonly loadPresetsUseCase: LoadPresetsUseCase,
    @inject(TYPES.SavePresetUseCase)
    private readonly savePresetUseCase: SavePresetUseCase,
    @inject(TYPES.LoadRecentPurchasesUseCase)
    private readonly loadRecentPurchasesUseCase: LoadRecentPurchasesUseCase
  ) {}

  async loadDashboard(userId: string): Promise<void> {
    this.viewModel.isLoading = true;
    this.viewModel.errorMessage = null;
    this.notifyViewModelChanged();

    try {
      const dashboard = await this.loadDashboardUseCase.execute(userId);
      this.viewModel.dashboard = dashboard;
    } catch (error) {
      this.viewModel.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.viewModel.isLoading = false;
      this.notifyViewModelChanged();
    }
  }

  getViewModel(): DashboardViewModel {
    return this.viewModel;
  }

  getIsLoading(): boolean {
    return this.viewModel.isLoading;
  }

  getErrorMessage(): string | null {
    return this.viewModel.errorMessage;
  }

  async enableRealtime(): Promise<void> {
    if (this.viewModel.realtimeConnected) return;

    try {
      await this.subscribeRealtimeUseCase.execute(
        this.realtimeChannels,
        (channel, data) => this.handleRealtimeUpdate(channel, data)
      );
      
      this.viewModel.realtimeConnected = true;
      this.viewModel.realtimePaused = false;
      this.notifyViewModelChanged();
    } catch (error) {
      this.viewModel.errorMessage = 'Failed to connect to realtime updates';
      this.notifyViewModelChanged();
    }
  }

  async disableRealtime(): Promise<void> {
    if (!this.viewModel.realtimeConnected) return;

    try {
      await this.unsubscribeRealtimeUseCase.execute(this.realtimeChannels);
      this.viewModel.realtimeConnected = false;
      this.notifyViewModelChanged();
    } catch (error) {
      this.viewModel.errorMessage = 'Failed to disconnect from realtime updates';
      this.notifyViewModelChanged();
    }
  }

  pauseRealtime(): void {
    this.viewModel.realtimePaused = true;
    this.notifyViewModelChanged();
  }

  resumeRealtime(): void {
    this.viewModel.realtimePaused = false;
    this.notifyViewModelChanged();
  }

  private handleRealtimeUpdate(channel: string, data: any): void {
    if (this.viewModel.realtimePaused || !this.viewModel.dashboard) return;

    // Update dashboard based on channel
    // For now, we'll just log the update
    // In a real implementation, we'd update the specific panel data
    console.log(`Realtime update on ${channel}:`, data);
    
    // Notify view to re-render
    this.notifyViewModelChanged();
  }

  async loadSettings(userId: string, queryParams?: URLSearchParams): Promise<void> {
    const settingsResult = this.loadSettingsUseCase.execute({ userId, queryParams });
    if (settingsResult.isSuccess()) {
      this.viewModel.settings = settingsResult.data!;
      this.notifyViewModelChanged();
    }
  }

  applySettings(userId: string, settings: DashboardSettings): void {
    const result = this.applySettingsUseCase.execute({ settings, userId });
    if (result.isSuccess()) {
      this.viewModel.settings = settings;
      this.viewModel.settingsPreview = null;
      
      // Update URL with query params
      if (typeof window !== 'undefined') {
        const params = settings.toQueryParams();
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
      }
      
      this.notifyViewModelChanged();
    }
  }

  resetSettings(userId: string): void {
    const result = this.resetSettingsUseCase.execute({ userId });
    if (result.isSuccess()) {
      this.viewModel.settings = result.data!;
      this.viewModel.settingsPreview = null;
      
      // Clear URL query params
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', window.location.pathname);
      }
      
      this.notifyViewModelChanged();
    }
  }

  previewSettings(settings: DashboardSettings): void {
    this.viewModel.settingsPreview = settings;
    this.notifyViewModelChanged();
  }

  async loadFilterPresets(): Promise<void> {
    const presetsResult = await this.loadPresetsUseCase.execute();
    if (presetsResult.isSuccess()) {
      this.viewModel.filterPresets = presetsResult.data;
      this.notifyViewModelChanged();
    }
  }

  async loadFilterPreset(presetId: string): Promise<void> {
    const presetResult = await this.loadPresetsUseCase.executeById(presetId);
    if (presetResult.isSuccess()) {
      this.viewModel.filterSet = presetResult.data.filterSet;
      this.viewModel.currentPresetId = presetId;
      this.updateUrlWithFilters();
      this.notifyViewModelChanged();
    }
  }

  async saveFilterPreset(name: string): Promise<void> {
    const result = await this.savePresetUseCase.execute({
      name,
      filterSet: this.viewModel.filterSet,
    });
    
    if (result.isSuccess()) {
      // Reload presets to include the new one
      await this.loadFilterPresets();
      this.viewModel.currentPresetId = result.data.id;
      this.notifyViewModelChanged();
    }
  }

  applyFilters(filterSet: FilterSet): void {
    this.viewModel.filterSet = filterSet;
    this.viewModel.currentPresetId = undefined; // Clear preset when manually changing filters
    this.updateUrlWithFilters();
    this.notifyViewModelChanged();
  }

  resetFilters(): void {
    this.viewModel.filterSet = FilterSet.createDefault();
    this.viewModel.currentPresetId = undefined;
    
    // Clear URL query params
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
    
    this.notifyViewModelChanged();
  }

  loadFiltersFromUrl(queryParams: URLSearchParams): void {
    const filterSetResult = FilterSet.fromQueryParams(Object.fromEntries(queryParams));
    
    if (filterSetResult.isSuccess()) {
      this.viewModel.filterSet = filterSetResult.data!;
      
      // Check if this matches a preset
      const presetId = queryParams.get('preset');
      if (presetId) {
        this.viewModel.currentPresetId = presetId;
      }
      
      this.notifyViewModelChanged();
    }
  }

  private updateUrlWithFilters(): void {
    if (typeof window !== 'undefined') {
      const params = this.viewModel.filterSet.toQueryParams();
      const searchParams = new URLSearchParams(params);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }

  async getRecentPurchases(limit: number = 50): Promise<PurchaseRow[]> {
    try {
      return await this.loadRecentPurchasesUseCase.execute(limit);
    } catch (error) {
      console.error('Failed to load recent purchases:', error);
      return [];
    }
  }

  private notifyViewModelChanged(): void {
    // No-op for now - we're not using reactive updates
    // this.onViewModelChanged();
  }
}
