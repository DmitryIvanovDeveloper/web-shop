import React, { useState } from 'react';
import { DashboardViewModel } from '../presenters/dashboard.presenter';
import { SalesPanel } from './SalesPanel';
import { RevenuePanel } from './RevenuePanel';
import { GeographyPanel } from './GeographyPanel';
import { ConversionPanel } from './ConversionPanel';
import { SettingsPanel } from './SettingsPanel';
import { FilterPanel } from './FilterPanel';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { ErrorBoundary } from '../../../../../../shared/ui/ErrorBoundary';
import { ConnectionStatus, useConnectionStatus } from '../../../../../../shared/ui/ConnectionStatus';
import { FallbackUI } from '../../../../../../shared/ui/FallbackUI';
import { MetricSelector, MetricOption } from './MetricSelector';
import { DrillDownModal } from '../../../../../../shared/ui/DrillDownModal';
import { DataTable, TableColumn } from '../../../../../../shared/ui/DataTable';
import { ExportDropdown } from '../../../../../../shared/ui/ExportButton';
import { MetricsCatalog } from './MetricsCatalog';
import { Portal } from '../../../../../../shared/ui/Portal';
import { FocusTrap } from '../../../../../../shared/ui/FocusTrap';
import { ToastContainer } from '../../../../../../shared/ui/Toast';
import { useToast } from '../../../../../../shared/hooks/useToast';
import { RetentionPanel } from './RetentionPanel';
import { PaymentMethodsPanel } from './PaymentMethodsPanel';
import { MarketingChannelsStackedPanel } from './MarketingChannelsStackedPanel';
import { CohortsPanel } from './CohortsPanel';
import { MetricsOverviewPanel } from './MetricsOverviewPanel';
import { LineSeries } from '../../../../../../shared/ui/charts/MultiLineChart';
import { TransactionsTable, TransactionRow } from '../../../../../../shared/ui/TransactionsTable';
import { RefundsTable, RefundRow } from '../../../../../../shared/ui/RefundsTable';

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
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showMetricsCatalog, setShowMetricsCatalog] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'revenue']);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const { status, lastConnected, retryCount, updateStatus, retry } = useConnectionStatus();
  const { toasts, toast, removeToast } = useToast();
  const anyOverlayOpen = showFilters || showSettings || showMetricSelector || showMetricsCatalog;
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (anyOverlayOpen) {
      lastFocusedRef.current = (document.activeElement as HTMLElement) || null;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowFilters(false);
          setShowSettings(false);
          setShowMetricSelector(false);
          setShowMetricsCatalog(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', onKeyDown);
        
        if (lastFocusedRef.current) {
          lastFocusedRef.current.focus();
          lastFocusedRef.current = null;
        }
      };
    }
  }, [anyOverlayOpen]);

  const availableMetrics: MetricOption[] = [
    { id: 'sales', label: 'Total Sales', category: 'Sales', color: '#3b82f6', description: 'Number of transactions' },
    { id: 'revenue', label: 'Revenue', category: 'Finance', color: '#10b981', description: 'Total revenue' },
    { id: 'arpu', label: 'ARPU', category: 'Sales', color: '#8b5cf6', description: 'Average revenue per user' },
    { id: 'conversion', label: 'Conversion Rate', category: 'Marketing', color: '#f59e0b', description: 'Conversion percentage' },
    { id: 'geography', label: 'Top Regions', category: 'Geography', color: '#06b6d4', description: 'Regional breakdown' },
  ];

  const handlePanelClick = (panelType: 'sales' | 'revenue' | 'geography' | 'conversion') => {
    const data = {
      sales: viewModel.dashboard?.salesSummary,
      revenue: viewModel.dashboard?.revenueSummary,
      geography: viewModel.dashboard?.geographySummary,
      conversion: viewModel.dashboard?.conversionSummary,
    };

    setDrillDownData({ type: panelType, data: data[panelType] });
    setIsDrillDownOpen(true);
  };

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
      {}
      <ConnectionStatus 
        status={status}
        lastConnected={lastConnected}
        retryCount={retryCount}
        onRetry={retry}
      />

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-[240px]">
            <h1 className="text-3xl font-bold mb-1">📊 {labels.title}</h1>
            <p className="text-gray-600 text-sm""toolbar" aria-label="Dashboard Actions" className="flex flex-wrap items-center justify-end gap-2">
            {}
            <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setShowMetricSelector(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                aria-pressed={showMetricSelector}
                title="Select metrics (M)"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Select Metrics</span>
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                aria-pressed={showFilters}
                title="Filters (Ctrl+F)"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
                aria-pressed={showSettings}
                title="Settings (Ctrl+S)"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
            {}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMetricsCatalog(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-pink-600 text-white hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-sm"
                aria-pressed={showMetricsCatalog}
                title="Metrics Catalog (Ctrl+K)"
              >
                <span>📚</span>
                <span className="hidden sm:inline">Catalog</span>
              </button>
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
            </div>
          </div>
        </div>
      </div>

      {}
      {showMetricSelector && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMetricSelector(false)} aria-hidden="true" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6">
              <FocusTrap initialFocusSelector="input,button,select,textarea">
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
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowMetricSelector(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Done</button>
              </div>
              </FocusTrap>
            </div>
          </div>
        </Portal>
      )}

      {}
      {showFilters && onApplyFilters && onResetFilters && onLoadFilterPreset && onSaveFilterPreset && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6">
              <FocusTrap initialFocusSelector="button,select,input">
                <FilterPanel
                  filterSet={viewModel.filterSet}
                  presets={viewModel.filterPresets}
                  currentPresetId={viewModel.currentPresetId}
                  onApply={(fs) => { onApplyFilters(fs); setShowFilters(false); toast.success({ title: 'Filters applied', duration: 2000 }); }}
                  onReset={onResetFilters}
                  onLoadPreset={onLoadFilterPreset}
                  onSavePreset={onSaveFilterPreset}
                  isLoading={viewModel.isLoading}
                />
              </FocusTrap>
            </div>
          </div>
        </Portal>
      )}

      {}
      {showSettings && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettings(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6">
              <FocusTrap initialFocusSelector="button,select,input">
                <SettingsPanel
                  settings={viewModel.settingsPreview || viewModel.settings}
                  onApply={(s) => { onApplySettings(s); setShowSettings(false); toast.success({ title: 'Settings applied', duration: 2000 }); }}
                  onReset={onResetSettings}
                  isPreview={!!viewModel.settingsPreview}
                />
              </FocusTrap>
            </div>
          </div>
        </Portal>
      )}

      {}
      {showMetricsCatalog && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMetricsCatalog(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>📚</span>
                  <span>Metrics Catalog</span>
                </h3>
                <button onClick={() => setShowMetricsCatalog(false)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                  Close
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <FocusTrap initialFocusSelector="input">
                  <div className="mx-auto max-w-3xl">
                    <MetricsCatalog />
                  </div>
                </FocusTrap>
              </div>
            </div>
          </div>
        </Portal>
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

      {}
      <MetricsOverviewPanel
        ltv={285}
        arppu={95}
        activePayingUsers={12450}
        refundRate={2.3}
        chargebackRate={0.8}
        currency={viewModel.dashboard.salesSummary?.currency || 'USD'}
      />

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {}
        {viewModel.dashboard.retentionSummary && (
          <ErrorBoundary>
            <RetentionPanel
              series={(viewModel.dashboard.retentionSummary.curves || []).map(curve => ({
                id: curve.cohortId,
                name: curve.cohortName,
                color: curve.cohortId === 'd1' ? '#3b82f6' : curve.cohortId === 'd7' ? '#10b981' : '#f59e0b',
                data: curve.points.map(p => ({ label: `D${p.day}`, value: p.retention })),
              }))}
            />
          </ErrorBoundary>
        )}

        {}
        {viewModel.dashboard.paymentMethodsSummary && (
          <ErrorBoundary>
            <PaymentMethodsPanel
              items={(viewModel.dashboard.paymentMethodsSummary.methods || []).map((m, idx) => ({
                name: m.method,
                value: m.revenue,
                color: ['#3b82f6', '#10b981', '#f59e0b'][idx % 3],
              }))}
            />
          </ErrorBoundary>
        )}

        {}
        {viewModel.dashboard.cohortSummary && (
          <ErrorBoundary>
            <CohortsPanel cohorts={viewModel.dashboard.cohortSummary.cohorts || []} />
          </ErrorBoundary>
        )}
      </div>

      {}
      {viewModel.dashboard.marketingChannelsSummary && (
        <div className="mt-6">
          <ErrorBoundary>
            <MarketingChannelsStackedPanel data={viewModel.dashboard.marketingChannelsSummary.timeSeries || []} />
          </ErrorBoundary>
        </div>
      )}

      {}
      <div className={`mt-6 p-4 rounded-lg border ${
        viewModel.realtimeConnected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3""grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h3>
          <TransactionsTable rows={(viewModel.dashboard.transactionsSummary?.transactions || []).slice(0, 10).map(t => ({
            id: t.id,
            createdAt: t.createdAt,
            user: t.user,
            amount: t.amount,
            currency: t.currency,
            country: t.country,
            method: t.method,
            status: t.status,
          }))} />
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Refunds & Chargebacks</h3>
          <RefundsTable rows={(viewModel.dashboard.refundsSummary?.refunds || []).map(r => ({
            id: r.id,
            transactionId: r.transactionId,
            createdAt: r.createdAt,
            amount: r.amount,
            currency: r.currency,
            reason: r.reason,
            type: r.type,
          }))} />
        </div>
      </div>

      {}
      <DrillDownModal
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        title={drillDownData?.type ? `${drillDownData.type.charAt(0).toUpperCase() + drillDownData.type.slice(1)} Details` : 'Details'}
        subtitle=""
        size="large"
      >
        {drillDownData && <DrillDownContent data={drillDownData} />}
      </DrillDownModal>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

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
    const tableData = (geoData?.regions || []).map((region: any) => ({
      id: region.country,
      country: region.country,
      share: region.percentage,
    }));

    const columns: TableColumn<any>[] = [
      { key: 'country', label: 'Country', sortable: true },
      { 
        key: 'share', 
        label: 'Market Share', 
        sortable: true, 
        align: 'right',
        render: (value) => `${Number(value).toFixed(1)}%`
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
    const convData = data.data || {};
    const funnelData = (convData.funnelSteps || []).map((step: any) => ({
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
              {Number(convData.overallRate ?? 0).toFixed(2)}%
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">Cart Abandonment</div>
            <div className="text-2xl font-bold text-yellow-900">
              {Number(convData.cartAbandonment ?? 0).toFixed(2)}%
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
