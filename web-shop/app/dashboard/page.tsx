"use client";

import React, { useEffect, useState } from 'react';
import { container } from '@/infrastructure/bootstrap/container';
import { DashboardPresenter, DashboardView } from '@/modules/merchant-admin/analytics/realtime-dashboard';
import { TYPES } from '@/modules/merchant-admin/analytics/realtime-dashboard/infrastructure/bootstrap/realtime-dashboard.types';
import { LoadDashboardUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-dashboard.use-case';
import { SubscribeRealtimeUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/unsubscribe-realtime.use-case';
import { ApplySettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/apply-settings.use-case';
import { ResetSettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/reset-settings.use-case';
import { LoadSettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-settings.use-case';
import { LoadPresetsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/save-preset.use-case';
import { LoadRecentPurchasesUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-recent-purchases.use-case';
import { DashboardSettings } from '@/modules/merchant-admin/analytics/realtime-dashboard/domain/value-objects/dashboard-settings.value-object';
import { FilterSet } from '@/modules/merchant-admin/analytics/realtime-dashboard/domain/value-objects/filter-set.value-object';

export default function DashboardPage() {
  const [presenter, setPresenter] = useState<DashboardPresenter | null>(null);
  const [, force] = useState<number>(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const resolveDeps = () => {
      const load = container.get<LoadDashboardUseCase>(TYPES.LoadDashboardUseCase);
      const subscribeRealtime = container.get<SubscribeRealtimeUseCase>(TYPES.SubscribeRealtimeUseCase);
      const unsubscribeRealtime = container.get<UnsubscribeRealtimeUseCase>(TYPES.UnsubscribeRealtimeUseCase);
      const applySettings = container.get<ApplySettingsUseCase>(TYPES.ApplySettingsUseCase);
      const resetSettings = container.get<ResetSettingsUseCase>(TYPES.ResetSettingsUseCase);
      const loadSettings = container.get<LoadSettingsUseCase>(TYPES.LoadSettingsUseCase);
      const loadPresets = container.get<LoadPresetsUseCase>(TYPES.LoadPresetsUseCase);
      const savePreset = container.get<SavePresetUseCase>(TYPES.SavePresetUseCase);
      const loadRecentPurchases = container.get<LoadRecentPurchasesUseCase>(TYPES.LoadRecentPurchasesUseCase);
      
      const p = new DashboardPresenter(
        load,
        subscribeRealtime,
        unsubscribeRealtime,
        applySettings,
        resetSettings,
        loadSettings,
        loadPresets,
        savePreset,
        loadRecentPurchases
      );

      // Subscribe React component to presenter view-model updates
      unsubscribe = p.subscribe(() => {
        force((x) => x + 1);
      });

      setPresenter(p);
      void p.loadDashboard('demo-user');
      void p.loadFilterPresets(); // Load presets on init
      
      // Load filters from URL if present
      const params = new URLSearchParams(window.location.search);
      if (params.toString()) {
        p.loadFiltersFromUrl(params);
      }
    };

    try {
      resolveDeps();
    } catch (e) {
      console.error('Failed to resolve dependencies:', e);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleApplySettings = (settings: DashboardSettings) => {
    if (presenter) {
      presenter.applySettings('demo-user', settings);
    }
  };

  const handleResetSettings = () => {
    if (presenter) {
      presenter.resetSettings('demo-user');
    }
  };

  const handleApplyFilters = (filterSet: FilterSet) => {
    if (presenter) {
      presenter.applyFilters(filterSet);
    }
  };

  const handleResetFilters = () => {
    if (presenter) {
      presenter.resetFilters();
    }
  };

  const handleLoadFilterPreset = (presetId: string) => {
    if (presenter) {
      presenter.loadFilterPreset(presetId);
    }
  };

  const handleSaveFilterPreset = (name: string) => {
    if (presenter) {
      presenter.saveFilterPreset(name);
    }
  };

  return (
    <main className="p-8">
      {presenter && (
        <DashboardView
          viewModel={presenter.getViewModel()}
          onApplySettings={handleApplySettings}
          onResetSettings={handleResetSettings}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onLoadFilterPreset={handleLoadFilterPreset}
          onSaveFilterPreset={handleSaveFilterPreset}
          labels={{
            title: 'Realtime Dashboard',
            loading: 'Загрузка...',
            error: 'Ошибка',
            noData: 'Нет данных',
          }}
        />
      )}
    </main>
  );
}

