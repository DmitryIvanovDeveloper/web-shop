import React from 'react';
import { MultiLineChart, LineSeries } from '../../../../../../shared/ui/charts/MultiLineChart';

export interface RetentionSeriesPoint {
  label: string; 
  value: number; 
}

export interface RetentionPanelProps {
  series: LineSeries[]; 
}

export const RetentionPanel: React.FC<RetentionPanelProps> = ({ series }) => {
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200/60 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg shadow-md">
            <span className="text-white text-lg">📉</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-sky-700 bg-clip-text text-transparent">Retention</h2>
        </div>
      </div>

      <MultiLineChart
        series={series}
        title="Retention Curves"
        height={260}
        showDots={true}
        fill={false}
      />
    </div>
  );
};

