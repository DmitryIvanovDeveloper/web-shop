'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { DashboardPresenter } from '../../presenters/dashboard.presenter';
import { MetricFormatter } from '../../formatters';
import type { RevenueSummary } from '../../../domain/entities/revenue-summary.entity';
import type { TrendDataPoint } from '../../../domain';

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
      await presenter.loadDashboard('demo-user');
      const viewModel = presenter.getViewModel();
      setState({ 
        data: viewModel.dashboard?.revenueSummary, 
        loading: viewModel.isLoading 
      });
    };
    void loadData();
    
  }, [presenter]);

  const trend = state?.data?.trend ?? [];
  
  const comparison = state?.data
    ? {
        percent: Math.abs(state.data.monthlyGrowth),
        direction: (state.data.monthlyGrowth > 0 
          ? 'up' 
          : state.data.monthlyGrowth < 0 
            ? 'down' 
            : 'neutral') as 'up' | 'down' | 'neutral'
      }
    : undefined;

  return (
    <div className="revenue-panel">
      <div className="revenue-panel-grid">
        {}
        <MetricCard
          title="Total Revenue"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatCurrency(state.data.totalRevenue) : '—'}
          comparison={comparison}
          trend={trend.map((p: any) => ({ date: p.timestamp.toISOString().split('T')[0], value: p.value }))}
          loading={state?.loading}
          error={state?.error}
        />

        {}
        <MetricCard
          title="Revenue Per Visitor"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatCurrency(state.data.revenuePerVisitor) : '—'}
          loading={state?.loading}
          error={state?.error}
          className="revenue-per-visitor-card"
        />

        {}
        <MetricCard
          title="Average Order Value"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatCurrency(state.data.averageOrderValue) : '—'}
          loading={state?.loading}
          error={state?.error}
          className="average-order-value-card"
        />
      </div>
    </div>
  );
}

