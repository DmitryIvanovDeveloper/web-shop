import React from 'react';
import { KPICard, KPIGrid } from '../../../../../../shared/ui/KPICard';

interface MetricsOverviewPanelProps {
  ltv?: number;
  arppu?: number;
  activePayingUsers?: number;
  refundRate?: number;
  chargebackRate?: number;
  currency?: string;
}

export const MetricsOverviewPanel: React.FC<MetricsOverviewPanelProps> = ({
  ltv = 0,
  arppu = 0,
  activePayingUsers = 0,
  refundRate = 0,
  chargebackRate = 0,
  currency = 'USD',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/60 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
            <span className="text-white text-lg">📊</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            Advanced Metrics
          </h2>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
          LIVE
        </div>
      </div>

      <KPIGrid columns={2} className="mb-4">
        <KPICard
          title="Lifetime Value (LTV)"
          value={formatCurrency(ltv)}
          change={8.2}
          changeLabel="vs last month"
          trend="up"
          status="success"
          icon="💎"
          subtitle="Average customer lifetime value"
        />
        <KPICard
          title="ARPPU"
          value={formatCurrency(arppu)}
          change={5.4}
          changeLabel="vs last month"
          trend="up"
          status="neutral"
          icon="💰"
          subtitle="Average revenue per paying user"
        />
      </KPIGrid>

      <KPIGrid columns={3} className="mb-0">
        <KPICard
          title="Active Paying Users"
          value={activePayingUsers.toLocaleString()}
          change={12.1}
          changeLabel="vs last month"
          trend="up"
          status="success"
          icon="👥"
        />
        <KPICard
          title="Refund Rate"
          value={`${refundRate.toFixed(2)}%`}
          change={-0.5}
          changeLabel="vs last month"
          trend="down"
          status="success"
          icon="↩️"
        />
        <KPICard
          title="Chargeback Rate"
          value={`${chargebackRate.toFixed(2)}%`}
          change={-0.2}
          changeLabel="vs last month"
          trend="down"
          status="success"
          icon="⚠️"
        />
      </KPIGrid>
    </div>
  );
};

