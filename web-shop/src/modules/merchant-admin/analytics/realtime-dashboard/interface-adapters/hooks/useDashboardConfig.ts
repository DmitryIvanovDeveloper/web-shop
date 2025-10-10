import { useState, useEffect } from 'react';
import { settingsRepository } from '../../infrastructure/repositories/settings.repository.mock';
import { metricsSelectionRepository } from '../../infrastructure/repositories/metrics-selection.repository.mock';
import { FilterApplier } from '../../infrastructure/utils/filter-applier';

interface DashboardConfig {
  settings: any | null;
  selectedMetrics: string[];
  visiblePanels: string[];
  filters: any;
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

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        // Load settings
        const settings = await settingsRepository.load();
        
        // Load metrics selection
        const metricsSelection = await metricsSelectionRepository.load();
        
        // Load filters
        const filters = await FilterApplier.loadCurrentFilters();

        setConfig({
          settings,
          selectedMetrics: metricsSelection?.selectedMetrics || [],
          visiblePanels: metricsSelection?.visiblePanels || [],
          filters,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load dashboard config:', error);
        setConfig(prev => ({ ...prev, isLoading: false }));
      }
    }

    loadConfig();
  }, []);

  const updateSettings = async (newSettings: any) => {
    await settingsRepository.save(newSettings);
    setConfig(prev => ({ ...prev, settings: newSettings }));
  };

  const updateMetrics = async (metrics: string[]) => {
    const current = metricsSelectionRepository.getCurrent();
    const updated = { ...current, selectedMetrics: metrics };
    await metricsSelectionRepository.save(updated as any);
    setConfig(prev => ({ ...prev, selectedMetrics: metrics }));
  };

  const updatePanels = async (panels: string[]) => {
    const current = metricsSelectionRepository.getCurrent();
    const updated = { ...current, visiblePanels: panels };
    await metricsSelectionRepository.save(updated as any);
    setConfig(prev => ({ ...prev, visiblePanels: panels }));
  };

  const updateFilters = async (newFilters: any) => {
    await FilterApplier.saveCurrentFilters(newFilters);
    setConfig(prev => ({ ...prev, filters: newFilters }));
  };

  const isPanelVisible = (panelId: string): boolean => {
    // If no panels configured, show all
    if (config.visiblePanels.length === 0) return true;
    return config.visiblePanels.includes(panelId);
  };

  const isMetricSelected = (metricId: string): boolean => {
    // If no metrics configured, show all
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

