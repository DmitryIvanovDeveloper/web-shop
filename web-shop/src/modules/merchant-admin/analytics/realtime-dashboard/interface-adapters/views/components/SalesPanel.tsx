'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { MiniTrendChart } from './MiniTrendChart';
import { DashboardPresenter } from '../../presenters/dashboard.presenter';
import { MetricFormatter } from '../../formatters';
import type { SalesSummary, TrendDataPoint } from '../../../domain';

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
      await presenter.loadSales();
      setState(presenter.state.sales ?? { loading: false });
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
    <div className="sales-panel">
      {/* Top row: Total Sales and Transactions (2 колонки как в референсе) */}
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

      {/* ARPU row (отдельная строка как в референсе) */}
      <div style={{ marginTop: 24 }}>
        <MetricCard
          title="ARPU"
          icon={DollarSign}
          value={presenter.state.revenue?.data ? MetricFormatter.formatARPU(presenter.state.revenue.data.arpu) : '—'}
          loading={presenter.state.revenue?.loading ?? false}
          error={presenter.state.revenue?.error}
        />
      </div>

      {/* Sales Trend full width */}
      <div style={{ marginTop: 24 }}>
        <MiniTrendChart
          data={trend.map((p: TrendDataPoint) => ({ date: p.date, value: p.value }))}
        />
      </div>
    </div>
  );
}



