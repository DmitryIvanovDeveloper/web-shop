'use client';

import React, { useState } from 'react';
import { DataTable, TableColumn } from '@/shared/ui/DataTable';
import { MetricSelector, MetricOption } from '@/modules/merchant-admin/analytics/realtime-dashboard/interface-adapters/ui/MetricSelector';
import { RatioBuilder } from '@/modules/merchant-admin/analytics/realtime-dashboard/interface-adapters/ui/RatioBuilder';
import { DrillDownModal, DrillDownBreadcrumb } from '@/shared/ui/DrillDownModal';

interface SampleData {
  id: number;
  product: string;
  sales: number;
  revenue: number;
  conversion: number;
  region: string;
}

const sampleData: SampleData[] = [
  { id: 1, product: 'Product A', sales: 1250, revenue: 45000, conversion: 3.5, region: 'US' },
  { id: 2, product: 'Product B', sales: 890, revenue: 32000, conversion: 2.8, region: 'EU' },
  { id: 3, product: 'Product C', sales: 2100, revenue: 78000, conversion: 4.2, region: 'Asia' },
  { id: 4, product: 'Product D', sales: 650, revenue: 24000, conversion: 2.1, region: 'US' },
  { id: 5, product: 'Product E', sales: 1800, revenue: 65000, conversion: 3.9, region: 'EU' },
  { id: 6, product: 'Product F', sales: 980, revenue: 35000, conversion: 3.1, region: 'Asia' },
  { id: 7, product: 'Product G', sales: 1450, revenue: 52000, conversion: 3.6, region: 'US' },
  { id: 8, product: 'Product H', sales: 720, revenue: 26000, conversion: 2.5, region: 'EU' },
];

const availableMetrics: MetricOption[] = [
  { id: 'sales', label: 'Total Sales', category: 'Sales', color: '#3b82f6', description: 'Number of units sold' },
  { id: 'revenue', label: 'Revenue', category: 'Finance', color: '#10b981', description: 'Total revenue generated' },
  { id: 'conversion', label: 'Conversion Rate', category: 'Marketing', color: '#f59e0b', description: 'Visitor to customer rate' },
  { id: 'arpu', label: 'ARPU', category: 'Finance', color: '#8b5cf6', description: 'Average revenue per user' },
  { id: 'transactions', label: 'Transactions', category: 'Sales', color: '#ec4899', description: 'Number of transactions' },
  { id: 'visitors', label: 'Visitors', category: 'Marketing', color: '#6366f1', description: 'Total visitors' },
];

export default function InteractionsDemoPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'revenue']);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>();
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [isRatioBuilderOpen, setIsRatioBuilderOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<SampleData | null>(null);

  const columns: TableColumn<SampleData>[] = [
    { key: 'product', label: 'Product', sortable: true },
    { 
      key: 'sales', 
      label: 'Sales', 
      sortable: true,
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    { 
      key: 'revenue', 
      label: 'Revenue', 
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toLocaleString()}`
    },
    { 
      key: 'conversion', 
      label: 'Conversion %', 
      sortable: true,
      align: 'right',
      render: (value) => `${value}%`
    },
    { key: 'region', label: 'Region', sortable: true, align: 'center' },
  ];

  const handleRowClick = (row: SampleData, index: number) => {
    setSelectedRowIndex(index);
    setDrillDownData(row);
    setIsDrillDownOpen(true);
  };

  const handleSaveMetric = (metric: any) => {
        alert(`Metric "${metric.name}" created successfully!`);
    setIsRatioBuilderOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🎯 Interactions Demo</h1>
          <p className="text-indigo-100""bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>1. Multi-Metric Selector</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4""bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🧮</span>
            <span>2. Ratio Builder</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4""px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors""mt-6">
              <RatioBuilder
                availableMetrics={availableMetrics}
                onSave={handleSaveMetric}
                onCancel={() => setIsRatioBuilderOpen(false)}
              />
            </div>
          )}
        </div>

        {}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>📋</span>
              <span>3. Interactive Table</span>
            </h2>
            <p className="text-sm text-gray-600""mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs""flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs""flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Home</kbd>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs""Product sales data table"
          />
        </div>

        {}
        <DrillDownModal
          isOpen={isDrillDownOpen}
          onClose={() => setIsDrillDownOpen(false)}
          title={`Product Details: ${drillDownData?.product}`}
          subtitle=""
          size="large"
        >
          {drillDownData && (
            <div className="space-y-6">
              <DrillDownBreadcrumb
                items={[
                  { label: 'Products', onClick: () => setIsDrillDownOpen(false) },
                  { label: drillDownData.product },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Sales</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {drillDownData.sales.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-green-900">
                    ${drillDownData.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium mb-1">Conversion Rate</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {drillDownData.conversion}%
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium mb-1">Region</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {drillDownData.region}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Additional Details</h3>
                <p className="text-sm text-gray-600">
                  This is a drill-down view. In a real application, this would show detailed analytics, 
                  historical trends, related products, and more in-depth metrics.
                </p>
              </div>
            </div>
          )}
        </DrillDownModal>

        {}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4""grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Sorting in Tables</h3>
                <p className="text-sm text-gray-600""flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Multi-Metric Selection</h3>
                <p className="text-sm text-gray-600""flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Derived Metrics</h3>
                <p className="text-sm text-gray-600""flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Drill-Down Flows</h3>
                <p className="text-sm text-gray-600""flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Keyboard Navigation</h3>
                <p className="text-sm text-gray-600">Arrow keys, Enter, Home, End</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Accessibility</h3>
                <p className="text-sm text-gray-600">ARIA labels, focus management, WCAG 2.1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

