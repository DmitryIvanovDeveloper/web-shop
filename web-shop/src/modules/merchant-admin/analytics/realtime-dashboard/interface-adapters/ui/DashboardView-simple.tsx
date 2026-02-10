import React from 'react';

interface DashboardViewProps {
  viewModel: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ viewModel }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Dashboard is loading...</p>
      </div>
    </div>
  );
};