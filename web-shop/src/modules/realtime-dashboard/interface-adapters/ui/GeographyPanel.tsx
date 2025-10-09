import React from 'react';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { DonutChart, DonutChartDataPoint } from '../../../../shared/ui/charts/DonutChart';

interface GeographyPanelProps {
  geographySummary: GeographySummary;
}

export const GeographyPanel: React.FC<GeographyPanelProps> = ({ geographySummary }) => {
  const chartData: DonutChartDataPoint[] = geographySummary.regions.map((region, index) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return {
      label: region.country,
      value: region.percentage,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
            <span className="text-white text-lg">🌍</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
            Geography Panel
          </h2>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
          LIVE
        </div>
      </div>

      {/* Donut Chart using new component */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/30">
        <DonutChart
          data={chartData}
          title="Regional Distribution"
          size={250}
          innerRadius={0.6}
          showLegend={true}
          showLabels={true}
        />
      </div>
    </div>
  );
};

