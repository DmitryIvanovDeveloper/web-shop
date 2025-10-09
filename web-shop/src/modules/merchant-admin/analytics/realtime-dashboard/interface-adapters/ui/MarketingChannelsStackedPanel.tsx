import React from 'react';
import { StackedAreaChart, StackedPoint } from '../../../../../../shared/ui/charts/StackedAreaChart';

interface MarketingChannelsStackedPanelProps {
  data: StackedPoint[]; // segmented revenue by channels over time
}

export const MarketingChannelsStackedPanel: React.FC<MarketingChannelsStackedPanelProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/60 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg shadow-md">
            <span className="text-white text-lg">🪄</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">Marketing Channels</h2>
        </div>
      </div>

      <StackedAreaChart data={data} title="Revenue by Channel (Stacked)" height={260} />
    </div>
  );
};


