import React from 'react';
import { BarChart, BarChartDataPoint } from '../../../../../../shared/ui/charts/BarChart';
import { KPICard, KPIGrid } from '../../../../../../shared/ui/KPICard';

export interface CohortItem {
  channel: string;
  users: number;
  revenue: number;
  retention: number;
}

interface CohortsPanelProps {
  cohorts: CohortItem[];
}

export const CohortsPanel: React.FC<CohortsPanelProps> = ({ cohorts }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const chartData: BarChartDataPoint[] = cohorts.map((c, i) => ({
    label: c.channel,
    value: c.revenue,
    color: colors[i % colors.length],
  }));

  const totalUsers = cohorts.reduce((sum, c) => sum + c.users, 0);
  const totalRevenue = cohorts.reduce((sum, c) => sum + c.revenue, 0);
  const avgRetention = cohorts.reduce((sum, c) => sum + c.retention, 0) / (cohorts.length || 1);

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md">
            <span className="text-white text-lg">👥</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent">
            Cohorts by Channel
          </h2>
        </div>
      </div>

      <KPIGrid columns={3} className="mb-6">
        <KPICard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon="👤"
          trend="up"
          status="neutral"
        />
        <KPICard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}k`}
          icon="💰"
          trend="up"
          status="success"
        />
        <KPICard
          title="Avg Retention"
          value={`${avgRetention.toFixed(1)}%`}
          icon="📊"
          trend="up"
          status="neutral"
        />
      </KPIGrid>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-rose-200/30">
        <BarChart
          data={chartData}
          title="Revenue by Acquisition Channel"
          height={240}
          showValues={true}
          showGrid={true}
        />
      </div>
    </div>
  );
};

