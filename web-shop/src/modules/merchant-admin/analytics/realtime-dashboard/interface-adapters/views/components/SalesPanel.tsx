'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { MiniTrendChart } from './MiniTrendChart';
import { DashboardPresenter } from '../../presenters/dashboard.presenter';
import { MetricFormatter } from '../../formatters';
import type { SalesSummary } from '../../../domain/entities/sales-summary.entity';
import type { TrendDataPoint } from '../../../domain/types/trend.types';

export interface SalesPanelProps {
  presenter: DashboardPresenter;
}

export function SalesPanel({ presenter }: SalesPanelProps) {
  const [state, setState] = useState<{
    data?: SalesSummary;
    loading: boolean;
    error?: string;
  }>({ loading: true });

  useEffect(() => {
    const loadData = async () => {
      setState({ loading: true });
      await presenter.loadDashboard('demo-user');
      const viewModel = presenter.getViewModel();
      setState({ 
        data: viewModel.dashboard?.salesSummary, 
        loading: viewModel.isLoading 
      });
    };
    void loadData();
    
  }, [presenter]);

  const trendData = state?.data?.trend?.dataPoints ?? [];

  const calculateGrowthRate = (trend: TrendDataPoint[]): number => {
    if (trend.length < 2) return 0;
    const firstValue = trend[0]?.value || 0;
    const lastValue = trend[trend.length - 1]?.value || 0;
    if (firstValue === 0) return lastValue > 0 ? 100 : 0;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const growthRate = state?.data ? calculateGrowthRate(trendData) : 0;
  
  const comparison = state?.data
    ? {
        percent: Math.abs(growthRate),
        direction: (growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral'
      }
    : undefined;

  return (
    <div className="sales-panel">
      {}
      <div className="sales-panel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '24px' }}>
        <MetricCard
          title="Sales"
          icon={ShoppingCart}
          value={state?.data ? MetricFormatter.formatCurrency(state.data.totalSales) : '—'}
          comparison={comparison}
          loading={state?.loading}
          error={state?.error}
        />

        <MetricCard
          title="Transactions"
          icon={ShoppingCart}
          value={state?.data ? state.data.transactions.toString() : '—'}
          loading={state?.loading}
          error={state?.error}
        />
      </div>

      {}
      <div style={{ marginTop: 24 }}>
        <MetricCard
          title="ARPU"
          icon={DollarSign}
          value={state?.data ? MetricFormatter.formatARPU(state.data.totalSales / (state.data.transactions || 1)) : '—'}
          loading={state?.loading}
          error={state?.error}
        />
      </div>

      {}
      <div style={{ marginTop: 24 }}>
        <MiniTrendChart
          data={trendData.map((p: TrendDataPoint) => ({ 
            date: p.timestamp ? p.timestamp.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
            value: p.value || 0 
          }))}
        />
      </div>
    </div>
  );
}

