'use client';

import React, { useState } from 'react';
import { PeriodPreset } from '../../../domain/value-objects/period.value-object';

export interface DateRangeFilterProps {
  value: PeriodPreset;
  onChange: (period: PeriodPreset) => void;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  className = ''
}: DateRangeFilterProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const options: Array<{ label: string; value: PeriodPreset }> = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Custom', value: 'custom' }
  ];

  const handleOptionClick = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(true);
    } else {
      onChange(preset);
      setShowCustomPicker(false);
    }
  };

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    // TODO: Implement custom date picker logic
    // For now, just call onChange with 'custom'
    onChange('custom');
    setShowCustomPicker(false);
  };

  return (
    <div className={`date-range-filter ${className}`}>
      <div className="date-range-filter-dropdown">
        <button className="date-range-filter-trigger">
          {options.find(opt => opt.value === value)?.label || 'Select Period'}
          <span className="dropdown-arrow">▼</span>
        </button>

        <div className="date-range-filter-options">
          {options.map(option => (
            <button
              key={option.value}
              className={`date-range-filter-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {showCustomPicker && (
        <div className="date-range-filter-custom">
          <div className="custom-date-inputs">
            <input
              type="date"
              placeholder="Start Date"
              className="custom-date-input"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              placeholder="End Date"
              className="custom-date-input"
            />
          </div>
          <div className="custom-date-actions">
            <button
              className="custom-date-cancel"
              onClick={() => setShowCustomPicker(false)}
            >
              Cancel
            </button>
            <button
              className="custom-date-apply"
              onClick={() => handleCustomDateChange('', '')}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
