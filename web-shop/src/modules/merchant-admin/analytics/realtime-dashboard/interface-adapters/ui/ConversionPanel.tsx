import React from 'react';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';
import { KPICard } from '../../../../../../shared/ui/KPICard';
import { BarChart, BarChartDataPoint } from '../../../../../../shared/ui/charts/BarChart';

interface ConversionPanelProps {
  conversionSummary: ConversionSummary;
}

export const ConversionPanel: React.FC<ConversionPanelProps> = ({ conversionSummary }) => {
  const channelData: BarChartDataPoint[] = conversionSummary.channels.map((channel, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    return {
      label: channel.name,
      value: channel.value,
      color: colors[index % colors.length],
    };
  });

  const conversionStatus = conversionSummary.conversionRate >= 4 ? 'success' : conversionSummary.conversionRate >= 3 ? 'warning' : 'danger';

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
            <span className="text-white text-lg">🎯</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
            Conversion Panel
          </h2>
        </div>
        <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          LIVE
        </div>
      </div>

      {/* KPI Card for Conversion Rate */}
      <div className="mb-6">
        <KPICard
          title="Conversion Rate"
          value={`${conversionSummary.conversionRate.toFixed(2)}%`}
          change={8.5}
          changeLabel="vs last month"
          trend="up"
          status={conversionStatus}
          icon="🎯"
          subtitle="Visitor to customer conversion"
        />
      </div>

      {/* Bar Chart for channels */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-200/30">
        <BarChart
          data={channelData}
          title="Channel Performance"
          height={250}
          showValues={true}
          showGrid={true}
          horizontal={false}
        />
      </div>
    </div>
  );
};

export default ConversionPanel;


