import React, { useState } from 'react';
import { DashboardViewModel } from '../presenters/dashboard.presenter';
import { DashboardHeader } from './DashboardHeader';
import { DashboardLayout } from './DashboardLayout';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { ConnectionStatus, useConnectionStatus } from '../../../../shared/ui/ConnectionStatus';
import { FallbackUI } from '../../../../shared/ui/FallbackUI';
import { MetricSelector } from './MetricSelector';
import { DrillDownModal } from '../../../../shared/ui/DrillDownModal';
import { AlertsIntegration } from './AlertsIntegration';
import { MetricsCatalog } from './MetricsCatalog';
import { DataUpdateAnnouncer } from '../../../../shared/ui/DataUpdateAnnouncer';
import { useKeyboardShortcuts } from '../../../../shared/hooks/useKeyboardShortcuts';

interface DashboardViewProps {
  viewModel: DashboardViewModel;
  onApplySettings: (settings: DashboardSettings) => void;
  onResetSettings: () => void;
  onApplyFilters?: (filterSet: FilterSet) => void;
  onResetFilters?: () => void;
  onLoadFilterPreset?: (presetId: string) => void;
  onSaveFilterPreset?: (name: string) => void;
  labels: {
    title: string;
    loading: string;
    error: string;
    noData: string;
  };
}

// Union type for sidebar panels
type SidebarPanel = 'filters' | 'settings' | null;

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  viewModel, 
  onApplySettings, 
  onResetSettings, 
  onApplyFilters,
  onResetFilters,
  onLoadFilterPreset,
  onSaveFilterPreset,
  labels 
}) => {
  // Simplified state management
  const [activeSidebar, setActiveSidebar] = useState<SidebarPanel>(null);
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showMetricsCatalog, setShowMetricsCatalog] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const { status, updateStatus, retry } = useConnectionStatus();

  // Handle panel click for drill-down
  const handlePanelClick = (panelType: 'sales' | 'revenue' | 'geography' | 'conversion') => {
    const data = viewModel.dashboard?.[`${panelType}Summary`];
    setDrillDownData({ type: panelType, data });
  };

  // Update connection status based on realtime state
  React.useEffect(() => {
    if (viewModel.realtimeConnected) {
      updateStatus('connected');
    } else if (viewModel.errorMessage) {
      updateStatus('error');
    } else {
      updateStatus('disconnected');
    }
  }, [viewModel.realtimeConnected, viewModel.errorMessage, updateStatus]);

  if (viewModel.isLoading) {
    return <FallbackUI type="loading" message={labels.loading} />;
  }

  if (viewModel.errorMessage) {
    return (
      <FallbackUI 
        type="error" 
        title={labels.error}
        message={viewModel.errorMessage}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!viewModel.dashboard) {
    return (
      <FallbackUI 
        type="no-data" 
        title={labels.noData}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <ConnectionStatus 
        status={status}
        lastConnected={lastConnected}
        retryCount={retryCount}
        onRetry={retry}
      />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 {labels.title}</h1>
            <p className="text-gray-600">
              Realtime analytics dashboard с мониторингом метрик в реальном времени.
            </p>
          </div>
          <div className="flex gap-3">
            <ExportDropdown
              data={{
                sales: viewModel.dashboard?.salesSummary,
                revenue: viewModel.dashboard?.revenueSummary,
                geography: viewModel.dashboard?.geographySummary,
                conversion: viewModel.dashboard?.conversionSummary,
                exportedAt: new Date().toISOString(),
              }}
              filename={`dashboard-export-${new Date().toISOString().split('T')[0]}`}
            />
            <button
              onClick={() => setShowMetricSelector(!showMetricSelector)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>📊</span>
              {showMetricSelector ? 'Hide Metrics' : 'Select Metrics'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>🔍</span>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>⚙️</span>
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            <button
              onClick={() => setShowMetricsCatalog(!showMetricsCatalog)}
              className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <span>📚</span>
              {showMetricsCatalog ? 'Hide Catalog' : 'Metrics Catalog'}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      {showMetricSelector && (
        <div className="mb-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Select Metrics to Display</span>
          </h3>
          <MetricSelector
            availableMetrics={availableMetrics}
            selectedMetrics={selectedMetrics}
            onSelect={setSelectedMetrics}
            maxSelection={5}
          />
          <div className="mt-4 text-sm text-gray-600">
            <strong>Selected:</strong> {selectedMetrics.map(id => availableMetrics.find(m => m.id === id)?.label).join(', ')}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && onApplyFilters && onResetFilters && onLoadFilterPreset && onSaveFilterPreset && (
        <div className="mb-6">
          <FilterPanel
            filterSet={viewModel.filterSet}
            presets={viewModel.filterPresets}
            currentPresetId={viewModel.currentPresetId}
            onApply={onApplyFilters}
            onReset={onResetFilters}
            onLoadPreset={onLoadFilterPreset}
            onSavePreset={onSaveFilterPreset}
            isLoading={viewModel.isLoading}
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6">
          <SettingsPanel
            settings={viewModel.settingsPreview || viewModel.settings}
            onApply={onApplySettings}
            onReset={onResetSettings}
            isPreview={!!viewModel.settingsPreview}
          />
        </div>
      )}

      {/* Metrics Catalog */}
      {showMetricsCatalog && (
        <div className="mb-6">
          <MetricsCatalog />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {viewModel.dashboard.salesSummary && (
          <ErrorBoundary>
            <div 
              onClick={() => handlePanelClick('sales')}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePanelClick('sales')}
            >
              <SalesPanel salesSummary={viewModel.dashboard.salesSummary} />
            </div>
          </ErrorBoundary>
        )}

        {viewModel.dashboard.revenueSummary && (
          <ErrorBoundary>
            <div 
              onClick={() => handlePanelClick('revenue')}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePanelClick('revenue')}
            >
              <RevenuePanel revenueSummary={viewModel.dashboard.revenueSummary} />
            </div>
          </ErrorBoundary>
        )}

        {viewModel.dashboard.geographySummary && (
          <ErrorBoundary>
            <div 
              onClick={() => handlePanelClick('geography')}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePanelClick('geography')}
            >
              <GeographyPanel geographySummary={viewModel.dashboard.geographySummary} />
            </div>
          </ErrorBoundary>
        )}

        {viewModel.dashboard.conversionSummary && (
          <ErrorBoundary>
            <div 
              onClick={() => handlePanelClick('conversion')}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePanelClick('conversion')}
            >
              <ConversionPanel conversionSummary={viewModel.dashboard.conversionSummary} />
            </div>
          </ErrorBoundary>
        )}
      </div>

      {/* Realtime Status & Controls */}
      <div className={`mt-6 p-4 rounded-lg border ${
        viewModel.realtimeConnected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              viewModel.realtimeConnected 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              viewModel.realtimeConnected 
                ? 'text-green-700' 
                : 'text-gray-600'
            }`}>
              {viewModel.realtimeConnected 
                ? viewModel.realtimePaused 
                  ? 'Realtime приостановлен' 
                  : 'Realtime активен'
                : 'Realtime отключен'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {viewModel.dashboard && (
        <div className="mt-6">
          <ErrorBoundary>
            <AlertsIntegration
              metrics={{
                refundRate: viewModel.dashboard.conversionSummary?.refundRate || 0,
                totalSales: viewModel.dashboard.salesSummary?.totalSales || 0,
                conversionRate: viewModel.dashboard.conversionSummary?.conversionRate || 0,
                revenue: viewModel.dashboard.revenueSummary?.totalRevenue || 0,
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        title={drillDownData?.type ? `${drillDownData.type.charAt(0).toUpperCase() + drillDownData.type.slice(1)} Details` : 'Details'}
        subtitle="Подробная информация с интерактивной таблицей"
        size="large"
      >
        {drillDownData && <DrillDownContent data={drillDownData} />}
      </DrillDownModal>
    </div>
  );
};

// DrillDown Content Component
function DrillDownContent({ data }: { data: any }) {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>();

  if (data.type === 'sales') {
    const salesData = data.data;
    const tableData = salesData.trend.map((point: any, index: number) => ({
      id: index,
      date: point.timestamp.toLocaleDateString(),
      sales: point.value,
    }));

    const columns: TableColumn<any>[] = [
      { key: 'date', label: 'Date', sortable: true },
      { 
        key: 'sales', 
        label: 'Sales ($)', 
        sortable: true, 
        align: 'right',
        render: (value) => `$${value.toLocaleString()}`
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Sales</div>
            <div className="text-2xl font-bold text-blue-900">
              ${salesData.totalSales.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Transactions</div>
            <div className="text-2xl font-bold text-green-900">
              {salesData.transactions.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">ARPU</div>
            <div className="text-2xl font-bold text-purple-900">
              ${salesData.arpu.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Sales Trend Data</h3>
            <p className="text-sm text-gray-600">Use keyboard (↑↓) to navigate, click headers to sort</p>
          </div>
          <DataTable
            data={tableData}
            columns={columns}
            pagination={true}
            pageSize={5}
            selectedRowIndex={selectedRowIndex}
            onRowClick={(row, index) => setSelectedRowIndex(index)}
            ariaLabel="Sales trend data table"
          />
        </div>
      </div>
    );
  }

  if (data.type === 'revenue') {
    const revenueData = data.data;
    const tableData = revenueData.trend.map((point: any, index: number) => ({
      id: index,
      date: point.timestamp.toLocaleDateString(),
      revenue: point.value,
    }));

    const columns: TableColumn<any>[] = [
      { key: 'date', label: 'Date', sortable: true },
      { 
        key: 'revenue', 
        label: 'Revenue ($)', 
        sortable: true, 
        align: 'right',
        render: (value) => `$${value.toLocaleString()}`
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-sm text-emerald-600 font-medium mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-900">
              ${revenueData.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Net Income</div>
            <div className="text-2xl font-bold text-green-900">
              ${revenueData.netIncome.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Monthly Growth</div>
            <div className="text-2xl font-bold text-blue-900">
              {revenueData.monthlyGrowth.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Revenue Trend Data</h3>
            <p className="text-sm text-gray-600">Use keyboard (↑↓) to navigate, click headers to sort</p>
          </div>
          <DataTable
            data={tableData}
            columns={columns}
            pagination={true}
            pageSize={5}
            selectedRowIndex={selectedRowIndex}
            onRowClick={(row, index) => setSelectedRowIndex(index)}
            ariaLabel="Revenue trend data table"
          />
        </div>
      </div>
    );
  }

  if (data.type === 'geography') {
    const geoData = data.data;
    const tableData = geoData.topRegions.map((region: any) => ({
      id: region.country,
      country: region.country,
      sales: region.sales,
      revenue: region.revenue,
      share: region.share,
    }));

    const columns: TableColumn<any>[] = [
      { key: 'country', label: 'Country', sortable: true },
      { 
        key: 'sales', 
        label: 'Sales', 
        sortable: true, 
        align: 'right',
        render: (value) => value.toLocaleString()
      },
      { 
        key: 'revenue', 
        label: 'Revenue ($)', 
        sortable: true, 
        align: 'right',
        render: (value) => `$${value.toLocaleString()}`
      },
      { 
        key: 'share', 
        label: 'Market Share', 
        sortable: true, 
        align: 'right',
        render: (value) => `${value.toFixed(1)}%`
      },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Regional Performance</h3>
            <p className="text-sm text-gray-600">Click headers to sort, use keyboard navigation</p>
          </div>
          <DataTable
            data={tableData}
            columns={columns}
            pagination={true}
            pageSize={5}
            selectedRowIndex={selectedRowIndex}
            onRowClick={(row, index) => setSelectedRowIndex(index)}
            ariaLabel="Regional performance data table"
          />
        </div>
      </div>
    );
  }

  if (data.type === 'conversion') {
    const convData = data.data;
    const funnelData = convData.funnelSteps.map((step: any) => ({
      id: step.stage,
      stage: step.stage,
      visitors: step.visitors,
      conversions: step.conversions,
      rate: (step.conversions / step.visitors * 100).toFixed(2),
    }));

    const columns: TableColumn<any>[] = [
      { key: 'stage', label: 'Funnel Stage', sortable: true },
      { 
        key: 'visitors', 
        label: 'Visitors', 
        sortable: true, 
        align: 'right',
        render: (value) => value.toLocaleString()
      },
      { 
        key: 'conversions', 
        label: 'Conversions', 
        sortable: true, 
        align: 'right',
        render: (value) => value.toLocaleString()
      },
      { 
        key: 'rate', 
        label: 'Conversion Rate', 
        sortable: true, 
        align: 'right',
        render: (value) => `${value}%`
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium mb-1">Overall Rate</div>
            <div className="text-2xl font-bold text-orange-900">
              {convData.overallRate.toFixed(2)}%
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">Cart Abandonment</div>
            <div className="text-2xl font-bold text-yellow-900">
              {convData.cartAbandonment.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>
            <p className="text-sm text-gray-600">Analyze each stage of the conversion funnel</p>
          </div>
          <DataTable
            data={funnelData}
            columns={columns}
            pagination={false}
            selectedRowIndex={selectedRowIndex}
            onRowClick={(row, index) => setSelectedRowIndex(index)}
            ariaLabel="Conversion funnel data table"
          />
        </div>
      </div>
    );
  }

  return <div>No data available</div>;
}
    