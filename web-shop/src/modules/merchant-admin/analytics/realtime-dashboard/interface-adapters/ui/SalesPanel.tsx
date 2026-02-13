import React from 'react';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { KPICard, KPIGrid } from '../../../../../../shared/ui/KPICard';
import { LineChart, LineChartDataPoint } from '../../../../../../shared/ui/charts/LineChart';

interface SalesPanelProps {
  salesSummary: SalesSummary;
}

export const SalesPanel: React.FC<SalesPanelProps> = ({ salesSummary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salesSummary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const trendData: LineChartDataPoint[] = salesSummary.trend.dataPoints.map((point) => ({
    label: point.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.value,
  }));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-6 shadow-lg">
      {}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <span className="text-white text-lg">📈</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Sales Panel
          </h2>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          LIVE
        </div>
      </div>

      {}
      <KPIGrid columns={3} className="mb-6">
        <KPICard
          title="Total Sales"
          value={formatCurrency(salesSummary.totalSales)}
          change={12.5}
          changeLabel="vs last week"
          trend="up"
          status="success"
          icon="💰"
        />
        <KPICard
          title="Transactions"
          value={salesSummary.transactions}
          change={8.3}
          changeLabel="vs last week"
          trend="up"
          status="success"
          icon="🛒"
        />
        <KPICard
          title="ARPU"
          value={formatCurrency(salesSummary.arpu)}
          change={3.8}
          changeLabel="vs last week"
          trend="up"
          status="neutral"
          icon="📊"
        />
      </KPIGrid>

      {}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/30">
        <LineChart
          data={trendData}
          title="Sales Trend"
          height={200}
          color="#3b82f6"
          smooth={true}
          fill={true}
          showDots={true}
        />
      </div>
    </div>
  );
};
