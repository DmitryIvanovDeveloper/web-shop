import React from 'react';
import { DashboardViewModel } from '../presenters/dashboard.presenter';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';

interface DashboardViewProps {
  viewModel: DashboardViewModel;
  onApplySettings: (settings: DashboardSettings) => void;
  onResetSettings: () => void;
  onApplyFilters: (filters: FilterSet) => void;
  onResetFilters: () => void;
  onToggleFullscreen: (panelId: string) => void;
  onDrillDown: (data: any) => void;
  onExport: (format: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  viewModel,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Sales</div>
            <div className="text-2xl font-bold text-blue-900">$0</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Revenue</div>
            <div className="text-2xl font-bold text-green-900">$0</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Conversion</div>
            <div className="text-2xl font-bold text-orange-900">0%</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Visitors</div>
            <div className="text-2xl font-bold text-purple-900">0</div>
          </div>
        </div>
      </div>
    </div>
  );
};