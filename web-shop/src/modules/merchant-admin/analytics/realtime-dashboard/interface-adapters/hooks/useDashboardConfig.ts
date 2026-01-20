import { useState, useEffect } from 'react';
import { settingsRepository } from '../../infrastructure/repositories/settings.repository.mock';
import { metricsSelectionRepository, type MetricsSelection } from '../../infrastructure/repositories/metrics-selection.repository.mock';
import { FilterApplier, type Filters } from '../../infrastructure/utils/filter-applier';

interface DashboardConfig {
  settings: unknown | null;
  selectedMetrics: string[];
  visiblePanels: string[];
  filters: Filters;
  isLoading: boolean;
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>({
    settings: null,
    selectedMetrics: [],
    visiblePanels: [],
    filters: {},
    isLoading: true,
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        
        const settings = await settingsRepository.load();

        const metricsSelection = await metricsSelectionRepository.load();

        const filters = await FilterApplier.loadCurrentFilters();

        setConfig({
          settings,
          selectedMetrics: metricsSelection?.selectedMetrics || [],
          visiblePanels: metricsSelection?.visiblePanels || [],
          filters,
          isLoading: false,
        });
      } catch {
        setConfig(prev => ({ ...prev, isLoading: false }));
      }
    }

    loadConfig();
  }, []);

  const updateSettings = async (newSettings: unknown) => {
    if (newSettings instanceof Object) {
      await settingsRepository.save(newSettings as never);
      setConfig(prev => ({ ...prev, settings: newSettings }));
    }
  };

  const updateMetrics = async (metrics: string[]) => {
    const current = metricsSelectionRepository.getCurrent();
    const updated: MetricsSelection = {
      selectedMetrics: metrics,
      visiblePanels: current?.visiblePanels ?? [],
      layout: current?.layout ?? 'default',
    };
    await metricsSelectionRepository.save(updated);
    setConfig(prev => ({ ...prev, selectedMetrics: metrics }));
  };

  const updatePanels = async (panels: string[]) => {
    const current = metricsSelectionRepository.getCurrent();
    const updated: MetricsSelection = {
      selectedMetrics: current?.selectedMetrics ?? [],
      visiblePanels: panels,
      layout: current?.layout ?? 'default',
    };
    await metricsSelectionRepository.save(updated);
    setConfig(prev => ({ ...prev, visiblePanels: panels }));
  };

  const updateFilters = async (newFilters: Filters) => {
    await FilterApplier.saveCurrentFilters(newFilters);
    setConfig(prev => ({ ...prev, filters: newFilters }));
  };

  const isPanelVisible = (panelId: string): boolean => {
    
    if (config.visiblePanels.length === 0) return true;
    return config.visiblePanels.includes(panelId);
  };

  const isMetricSelected = (metricId: string): boolean => {
    
    if (config.selectedMetrics.length === 0) return true;
    return config.selectedMetrics.includes(metricId);
  };

  return {
    ...config,
    updateSettings,
    updateMetrics,
    updatePanels,
    updateFilters,
    isPanelVisible,
    isMetricSelected,
  };
}

