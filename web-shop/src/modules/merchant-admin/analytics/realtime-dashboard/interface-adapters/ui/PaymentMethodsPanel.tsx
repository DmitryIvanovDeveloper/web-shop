import React from 'react';
import { BarChart, BarChartDataPoint } from '../../../../../../shared/ui/charts/BarChart';

export interface PaymentMethodItem { name: string; value: number; color?: string; }

interface PaymentMethodsPanelProps {
  items: PaymentMethodItem[]; 
}

export const PaymentMethodsPanel: React.FC<PaymentMethodsPanelProps> = ({ items }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b'];
  const data: BarChartDataPoint[] = items.map((it, i) => ({ label: it.name, value: it.value, color: it.color || colors[i % colors.length] }));

  return (
    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200/60 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg shadow-md">
            <span className="text-white text-lg">💳</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">Payment Methods</h2>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-violet-200/30">
        <BarChart data={data} title="Split by Payment Methods" height={240} showValues={true} showGrid={true} />
      </div>
    </div>
  );
};

