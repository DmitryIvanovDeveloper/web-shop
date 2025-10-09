import React from 'react';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';

export interface SettingsPanelProps {
  settings: DashboardSettings;
  onApply: (settings: DashboardSettings) => void;
  onReset: () => void;
  isPreview: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onApply, onReset, isPreview }) => {
  const [dateRange, setDateRange] = React.useState(settings.dateRange);
  const [refreshInterval, setRefreshInterval] = React.useState(settings.refreshInterval);
  const [theme, setTheme] = React.useState(settings.theme);

  const handleApply = () => {
    const newSettings = new DashboardSettings(dateRange, refreshInterval, theme);
    onApply(newSettings);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">⚙️ Dashboard Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval (ms)</label>
          <input
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            min="1000"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Settings
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
