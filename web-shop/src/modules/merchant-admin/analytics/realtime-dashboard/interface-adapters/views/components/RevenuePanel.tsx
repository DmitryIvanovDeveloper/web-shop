'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { DashboardPresenter } from '../../presenters/dashboard.presenter';
import { MetricFormatter } from '../../formatters';
import type { RevenueSummary, TrendDataPoint } from '../../../domain';

export interface RevenuePanelProps {
  presenter: DashboardPresenter;
}

export function RevenuePanel({ presenter }: RevenuePanelProps) {
  const [state, setState] = useState<{
    data?: RevenueSummary;
    loading: boolean;
    error?: string;
  }>({ loading: true });

  useEffect(() => {
    const loadData = async () => {
      setState({ loading: true });
      await presenter.loadRevenue();
      setState(presenter.state.revenue ?? { loading: false });
    };
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presenter]);

  const trend = state?.data?.trend.dataPoints ?? [];
  
  const comparison = state?.data
    ? {
        percent: state.data.getGrowthRate(),
        direction: (state.data.isGrowing() 
          ? 'up' 
          : state.data.isCriticalChange() && state.data.getGrowthRate() < 0 
            ? 'down' 
            : 'neutral') as 'up' | 'down' | 'neutral'
      }
    : undefined;

  return (
    <div className="revenue-panel">
      <div className="revenue-panel-grid">
        {/* Total Revenue */}
        <MetricCard
          title="Total Revenue"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatCurrency(state.data.totalRevenue) : '—'}
          comparison={comparison}
          trend={trend.map((p: TrendDataPoint) => ({ date: p.date, value: p.value }))}
          loading={state?.loading}
          error={state?.error}
        />

        {/* ARPU */}
        <MetricCard
          title="ARPU"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatARPU(state.data.arpu) : '—'}
          loading={state?.loading}
          error={state?.error}
          className="arpu-card"
        />

        {/* ARPPU */}
        <MetricCard
          title="ARPPU"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatARPU(state.data.arppu) : '—'}
          loading={state?.loading}
          error={state?.error}
          className="arppu-card"
        />
      </div>
    </div>
  );
}

