            import React from 'react';
import { ExportDropdown } from '../../../../../../shared/ui/ExportButton';

interface DashboardHeaderProps {
  title: string;
  onToggleFilters: () => void;
  onToggleSettings: () => void;
  onToggleMetrics: () => void;
  onToggleCatalog: () => void;
  showFilters: boolean;
  showSettings: boolean;
  showMetrics: boolean;
  showCatalog: boolean;
  exportData: any;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onToggleFilters,
  onToggleSettings,
  onToggleMetrics,
  onToggleCatalog,
  showFilters,
  showSettings,
  showMetrics,
  showCatalog,
  exportData,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              {}
              Last 7 days • All regions • USD · <span className="text-gray-400">Last updated just now</span>
            </p>
          </div>

          {}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {}
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Dashboard controls">
              <button
                onClick={onToggleMetrics}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                aria-pressed={showMetrics}
                aria-label="Toggle metric selector"
              >
                <span className="hidden sm:inline">Select Metrics</span>
                <span className="sm:hidden" aria-hidden="true">📊</span>
              </button>

              <ExportDropdown data={exportData} />
            </div>

            {}
            <div className="hidden md:flex gap-2 ml-2 pl-2 border-l border-gray-300 flex-wrap">
              <button
                onClick={onToggleFilters}
                    className="filter-button px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
                aria-pressed={showFilters}
                aria-label="Toggle filters panel"
              >
                <span aria-hidden="true">🔍</span>
                <span className="hidden lg:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>

              <button
                onClick={onToggleSettings}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                aria-pressed={showSettings}
                aria-label="Toggle settings panel"
              >
                <span aria-hidden="true">⚙️</span>
                <span className="hidden lg:inline">{showSettings ? 'Hide' : 'Show'} Settings</span>
              </button>

              <button
                onClick={onToggleCatalog}
                className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-md"
                aria-pressed={showCatalog}
                aria-label="Toggle metrics catalog"
              >
                <span aria-hidden="true">📚</span>
                <span className="hidden lg:inline">{showCatalog ? 'Hide' : 'Show'} Catalog</span>
              </button>
            </div>

            {}
            <div className="md:hidden">
              <button
                onClick={onToggleSettings}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open settings menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

