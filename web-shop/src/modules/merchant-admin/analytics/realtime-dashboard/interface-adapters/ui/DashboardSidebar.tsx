import React, { useEffect } from 'react';
import { FilterPanel } from './FilterPanel';
import { SettingsPanel } from './SettingsPanel';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';

interface DashboardSidebarProps {
  activePanel: 'filters' | 'settings' | null;
  onClose: () => void;
  // Filter props
  filterSet?: FilterSet;
  presets?: FilterPreset[];
  currentPresetId?: string;
  onApplyFilters?: (filters: FilterSet) => void;
  onResetFilters?: () => void;
  onLoadPreset?: (id: string) => void;
  onSavePreset?: (name: string) => void;
  // Settings props
  settings?: DashboardSettings;
  settingsPreview?: DashboardSettings;
  onApplySettings?: (settings: DashboardSettings) => void;
  onResetSettings?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activePanel,
  onClose,
  filterSet,
  presets,
  currentPresetId,
  onApplyFilters,
  onResetFilters,
  onLoadPreset,
  onSavePreset,
  settings,
  settingsPreview,
  onApplySettings,
  onResetSettings,
}) => {
  if (!activePanel) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        role="complementary"
        aria-label={activePanel === 'filters' ? 'Filters panel' : 'Settings panel'}
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {activePanel === 'filters' ? (
              <span><span aria-hidden="true">🔍</span> Filters</span>
            ) : (
              <span><span aria-hidden="true">⚙️</span> Settings</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activePanel === 'filters' && filterSet && (
            <FilterPanel
              filterSet={filterSet}
              presets={presets || []}
              currentPresetId={currentPresetId}
              onApply={onApplyFilters || (() => {})}
              onReset={onResetFilters || (() => {})}
              onLoadPreset={onLoadPreset || (() => {})}
              onSavePreset={onSavePreset || (() => {})}
            />
          )}

          {activePanel === 'settings' && settings && (
            <SettingsPanel
              settings={settingsPreview || settings}
              onApply={onApplySettings || (() => {})}
              onReset={onResetSettings || (() => {})}
              isPreview={!!settingsPreview}
            />
          )}
        </div>
      </aside>
    </>
  );
};



