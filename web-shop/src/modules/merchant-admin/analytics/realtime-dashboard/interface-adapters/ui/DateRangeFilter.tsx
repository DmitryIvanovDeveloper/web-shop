import React, { useState } from 'react';
import { DateRangePreset, DateGranularity } from '../../domain/value-objects/date-range-filter.value-object';

interface DateRangeFilterProps {
  preset: DateRangePreset;
  granularity: DateGranularity;
  customFrom?: Date;
  customTo?: Date;
  onPresetChange: (preset: DateRangePreset) => void;
  onGranularityChange: (granularity: DateGranularity) => void;
  onCustomRangeChange: (from: Date, to: Date) => void;
}

const PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const GRANULARITY_OPTIONS: { value: DateGranularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  preset,
  granularity,
  customFrom,
  customTo,
  onPresetChange,
  onGranularityChange,
  onCustomRangeChange,
}) => {
  const [from, setFrom] = useState(customFrom?.toISOString().split('T')[0] || '');
  const [to, setTo] = useState(customTo?.toISOString().split('T')[0] || '');

  const handlePresetChange = (newPreset: DateRangePreset): void => {
    onPresetChange(newPreset);
  };

  const handleCustomDateChange = (): void => {
    if (from && to) {
      onCustomRangeChange(new Date(from), new Date(to));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="mr-2">📅</span>
          Date Range
        </label>
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          {PRESET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (to) {
                  onCustomRangeChange(new Date(e.target.value), new Date(to));
                }
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                if (from) {
                  onCustomRangeChange(new Date(from), new Date(e.target.value));
                }
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="mr-2">📊</span>
          Granularity
        </label>
        <div className="flex gap-2">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onGranularityChange(option.value)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                granularity === option.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

