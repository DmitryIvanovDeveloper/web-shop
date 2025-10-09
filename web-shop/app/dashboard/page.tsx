"use client";

import React, { useEffect, useState } from 'react';
import { Container } from '@/infrastructure/bootstrap/container';
import { DashboardPresenter, DashboardView, RealtimeDashboardBootstrap } from '@/modules/merchant-admin/analytics/realtime-dashboard';
import { LoadDashboardUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-dashboard.use-case';
import { SubscribeRealtimeUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/subscribe-realtime.use-case';
import { UnsubscribeRealtimeUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/unsubscribe-realtime.use-case';
import { ApplySettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/apply-settings.use-case';
import { ResetSettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/reset-settings.use-case';
import { LoadSettingsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-settings.use-case';
import { LoadPresetsUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '@/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases/save-preset.use-case';
import { DashboardSettings } from '@/modules/merchant-admin/analytics/realtime-dashboard/domain/value-objects/dashboard-settings.value-object';
import { FilterSet } from '@/modules/merchant-admin/analytics/realtime-dashboard/domain/value-objects/filter-set.value-object';

export default function DashboardPage() {
  const [presenter, setPresenter] = useState<DashboardPresenter | null>(null);
  const [, force] = useState<number>(0);

  useEffect(() => {
    const container = Container.getInstance();
    const resolveDeps = () => {
      const load = container.get<LoadDashboardUseCase>('realtimeDashboard.loadDashboardUseCase');
      const subscribe = container.get<SubscribeRealtimeUseCase>('realtimeDashboard.subscribeRealtimeUseCase');
      const unsubscribe = container.get<UnsubscribeRealtimeUseCase>('realtimeDashboard.unsubscribeRealtimeUseCase');
      const applySettings = container.get<ApplySettingsUseCase>('realtimeDashboard.applySettingsUseCase');
      const resetSettings = container.get<ResetSettingsUseCase>('realtimeDashboard.resetSettingsUseCase');
      const loadSettings = container.get<LoadSettingsUseCase>('realtimeDashboard.loadSettingsUseCase');
      const loadPresets = container.get<LoadPresetsUseCase>('realtimeDashboard.loadPresetsUseCase');
      const savePreset = container.get<SavePresetUseCase>('realtimeDashboard.savePresetUseCase');
      
      const p = new DashboardPresenter(
        load,
        subscribe,
        unsubscribe,
        applySettings,
        resetSettings,
        loadSettings,
        loadPresets,
        savePreset,
        () => force((v) => v + 1)
      );
      setPresenter(p);
      p.loadDashboard('demo-user');
      p.loadFilterPresets(); // Load presets on init
      
      // Load filters from URL if present
      const params = new URLSearchParams(window.location.search);
      if (params.toString()) {
        p.loadFiltersFromUrl(params);
      }
    };

    try {
      resolveDeps();
    } catch {
      try {
        RealtimeDashboardBootstrap.initialize();
        resolveDeps();
      } catch (e) {
        console.error(e);
      }
    }
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

