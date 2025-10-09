import React from 'react';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { KPICard, KPIGrid } from '../../../../../../shared/ui/KPICard';
import { LineChart, LineChartDataPoint } from '../../../../../../shared/ui/charts/LineChart';

interface RevenuePanelProps {
  revenueSummary: RevenueSummary;
}

export const RevenuePanel: React.FC<RevenuePanelProps> = ({ revenueSummary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: revenueSummary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const trendData: LineChartDataPoint[] = revenueSummary.trend.map((point) => ({
    label: point.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.value,
  }));

  const growthTrend = revenueSummary.monthlyGrowth >= 0 ? 'up' : 'down';
  const growthStatus = revenueSummary.monthlyGrowth >= 10 ? 'success' : revenueSummary.monthlyGrowth >= 5 ? 'warning' : 'neutral';

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
            <span className="text-white text-lg">💰</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
            Revenue Panel
          </h2>
        </div>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
          LIVE
        </div>
      </div>

      {/* KPI Cards using new component */}
      <KPIGrid columns={3} className="mb-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(revenueSummary.totalRevenue)}
          change={12.8}
          changeLabel="vs last week"
          trend="up"
          status="success"
          icon="💰"
        />
        <KPICard
          title="Average Order Value"
          value={formatCurrency(revenueSummary.averageOrderValue)}
          change={5.2}
          changeLabel="vs last week"
          trend="up"
          status="neutral"
          icon="🛍️"
        />
        <KPICard
          title="Revenue Per Visitor"
          value={formatCurrency(revenueSummary.revenuePerVisitor)}
          change={3.1}
          changeLabel="vs last week"
          trend="up"
          status="neutral"
          icon="👤"
        />
      </KPIGrid>

      <KPIGrid columns={2} className="mb-6">
        <KPICard
          title="Net Income"
          value={formatCurrency(revenueSummary.netIncome)}
          change={15.2}
          changeLabel="vs last month"
          trend="up"
          status="success"
          icon="💵"
        />
        <KPICard
          title="Monthly Growth"
          value={`${revenueSummary.monthlyGrowth.toFixed(1)}%`}
          change={4.5}
          changeLabel="vs last month"
          trend={growthTrend}
          status={growthStatus}
          icon="📈"
        />
      </KPIGrid>

      {/* Line Chart for trend */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/30">
        <LineChart
          data={trendData}
          title="Revenue Trend"
          height={200}
          color="#10b981"
          smooth={true}
          fill={true}
          showDots={true}
        />
      </div>
    </div>
  );
};
