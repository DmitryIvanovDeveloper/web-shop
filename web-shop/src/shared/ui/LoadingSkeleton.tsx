import React from 'react';

export const PanelSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
    <div className="h-40 bg-gray-100 rounded" />
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded" />
      ))}
    </div>
  </div>
);

export default PanelSkeleton;


