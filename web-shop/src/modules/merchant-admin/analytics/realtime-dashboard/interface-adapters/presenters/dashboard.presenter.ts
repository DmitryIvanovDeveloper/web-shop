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
import type { Logger } from '@/application/ports/logger.port';
import { ROOT_TYPES } from '@/infrastructure/bootstrap/types';

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
  private _viewModel: DashboardViewModel = {
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

  private readonly _subscribers = new Set<() => void>();
  private _realtimeChannels = [
    'dashboard.sales',
    'dashboard.revenue',
    'dashboard.geography',
    'dashboard.conversion'
  ];

  public constructor(
    @inject(TYPES.LoadDashboardUseCase)
    private readonly _loadDashboardUseCase: LoadDashboardUseCase,
    @inject(TYPES.SubscribeRealtimeUseCase)
    private readonly _subscribeRealtimeUseCase: SubscribeRealtimeUseCase,
    @inject(TYPES.UnsubscribeRealtimeUseCase)
    private readonly _unsubscribeRealtimeUseCase: UnsubscribeRealtimeUseCase,
    @inject(TYPES.ApplySettingsUseCase)
    private readonly _applySettingsUseCase: ApplySettingsUseCase,
    @inject(TYPES.ResetSettingsUseCase)
    private readonly _resetSettingsUseCase: ResetSettingsUseCase,
    @inject(TYPES.LoadSettingsUseCase)
    private readonly _loadSettingsUseCase: LoadSettingsUseCase,
    @inject(TYPES.LoadPresetsUseCase)
    private readonly _loadPresetsUseCase: LoadPresetsUseCase,
    @inject(TYPES.SavePresetUseCase)
    private readonly _savePresetUseCase: SavePresetUseCase,
    @inject(TYPES.LoadRecentPurchasesUseCase)
    private readonly _loadRecentPurchasesUseCase: LoadRecentPurchasesUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public subscribe(callback: () => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  public async loadDashboard(userId: string): Promise<void> {
    this._viewModel.isLoading = true;
    this._viewModel.errorMessage = null;
    this.notifyViewModelChanged();

    try {
      const dashboard = await this._loadDashboardUseCase.execute(userId);
      this._viewModel.dashboard = dashboard;
    } catch (error) {
      this._viewModel.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this._viewModel.isLoading = false;
      this.notifyViewModelChanged();
    }
  }

  public getViewModel(): DashboardViewModel {
    return this._viewModel;
  }

  public getIsLoading(): boolean {
    return this._viewModel.isLoading;
  }

  public getErrorMessage(): string | null {
    return this._viewModel.errorMessage;
  }

  public async enableRealtime(): Promise<void> {
    if (this._viewModel.realtimeConnected) return;

    try {
      await this._subscribeRealtimeUseCase.execute(
        this._realtimeChannels,
        (channel, data) => this.handleRealtimeUpdate(channel, data)
      );
      
      this._viewModel.realtimeConnected = true;
      this._viewModel.realtimePaused = false;
      this.notifyViewModelChanged();
    } catch (error) {
      this._viewModel.errorMessage = 'Failed to connect to realtime updates';
      this.notifyViewModelChanged();
    }
  }

  public async disableRealtime(): Promise<void> {
    if (!this._viewModel.realtimeConnected) return;

    try {
      await this._unsubscribeRealtimeUseCase.execute(this._realtimeChannels);
      this._viewModel.realtimeConnected = false;
      this.notifyViewModelChanged();
    } catch (error) {
      this._viewModel.errorMessage = 'Failed to disconnect from realtime updates';
      this.notifyViewModelChanged();
    }
  }

  public pauseRealtime(): void {
    this._viewModel.realtimePaused = true;
    this.notifyViewModelChanged();
  }

  public resumeRealtime(): void {
    this._viewModel.realtimePaused = false;
    this.notifyViewModelChanged();
  }

  private handleRealtimeUpdate(channel: string, data: unknown): void {
    if (this._viewModel.realtimePaused || !this._viewModel.dashboard) return;

    // Update dashboard based on channel
    // For now, we only emit a lightweight debug entry through LoggerPort
    this.logger.debug?.('[DashboardPresenter] Realtime update received', {
      channel,
      hasData: data != null,
    });
    
    // Notify view to re-render
    this.notifyViewModelChanged();
  }

  async loadSettings(userId: string, queryParams?: URLSearchParams): Promise<void> {
    const settingsResult = this._loadSettingsUseCase.execute({ userId, queryParams });
    if (!settingsResult.isSuccess()) {
      return;
    }

    this._viewModel.settings = settingsResult.data!;
      this.notifyViewModelChanged();
    }

  public applySettings(userId: string, settings: DashboardSettings): void {
    const result = this._applySettingsUseCase.execute({ settings, userId });
    if (!result.isSuccess()) {
      return;
    }

    this._viewModel.settings = settings;
    this._viewModel.settingsPreview = null;
      
      // Update URL with query params
      if (typeof window !== 'undefined') {
        const params = settings.toQueryParams();
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
      }
      
      this.notifyViewModelChanged();
    }

  public resetSettings(userId: string): void {
    const result = this._resetSettingsUseCase.execute({ userId });
    if (!result.isSuccess()) {
      return;
    }

    this._viewModel.settings = result.data!;
    this._viewModel.settingsPreview = null;
      
      // Clear URL query params
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', window.location.pathname);
      }
      
      this.notifyViewModelChanged();
    }

  public previewSettings(settings: DashboardSettings): void {
    this._viewModel.settingsPreview = settings;
    this.notifyViewModelChanged();
  }

  public async loadFilterPresets(): Promise<void> {
    const presetsResult = await this._loadPresetsUseCase.execute();
    if (!presetsResult.isSuccess()) {
      return;
    }

    this._viewModel.filterPresets = presetsResult.data;
    this.notifyViewModelChanged();
  }

  public async loadFilterPreset(presetId: string): Promise<void> {
    const presetResult = await this._loadPresetsUseCase.executeById(presetId);
    if (!presetResult.isSuccess()) {
      return;
    }

    this._viewModel.filterSet = presetResult.data.filterSet;
    this._viewModel.currentPresetId = presetId;
      this.updateUrlWithFilters();
      this.notifyViewModelChanged();
  }

  public async saveFilterPreset(name: string): Promise<void> {
    const result = await this._savePresetUseCase.execute({
      name,
      filterSet: this._viewModel.filterSet,
    });
    
    if (!result.isSuccess()) {
      return;
    }

      // Reload presets to include the new one
      await this.loadFilterPresets();
    this._viewModel.currentPresetId = result.data.id;
      this.notifyViewModelChanged();
    }

  public applyFilters(filterSet: FilterSet): void {
    this._viewModel.filterSet = filterSet;
    this._viewModel.currentPresetId = undefined; // Clear preset when manually changing filters
    this.updateUrlWithFilters();
    this.notifyViewModelChanged();
  }

  public resetFilters(): void {
    this._viewModel.filterSet = FilterSet.createDefault();
    this._viewModel.currentPresetId = undefined;
    
    // Clear URL query params
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
    
    this.notifyViewModelChanged();
  }

  public loadFiltersFromUrl(queryParams: URLSearchParams): void {
    const filterSetResult = FilterSet.fromQueryParams(Object.fromEntries(queryParams));
    
    if (!filterSetResult.isSuccess()) {
      return;
    }

    this._viewModel.filterSet = filterSetResult.data!;
      
      // Check if this matches a preset
      const presetId = queryParams.get('preset');
      if (presetId) {
      this._viewModel.currentPresetId = presetId;
      }
      
      this.notifyViewModelChanged();
  }

  private updateUrlWithFilters(): void {
    if (typeof window !== 'undefined') {
      const params = this._viewModel.filterSet.toQueryParams();
      const searchParams = new URLSearchParams(params);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }

  public async getRecentPurchases(limit: number = 50): Promise<PurchaseRow[]> {
    try {
      return await this._loadRecentPurchasesUseCase.execute(limit);
    } catch (error) {
      this.logger.error('[DashboardPresenter] Failed to load recent purchases', error as Error);
      return [];
    }
  }

  private notifyViewModelChanged(): void {
    this._subscribers.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        // Swallow subscriber errors to avoid breaking presenter logic
        this.logger.error('[DashboardPresenter] Error in subscriber callback', error as Error);
      }
    });
  }
}

