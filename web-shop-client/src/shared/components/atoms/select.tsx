'use client';

import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { SelectOption } from '../../../shared/ui/action-context';

export interface SelectProps {
  readonly options: SelectOption[];
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange = () => {},
  placeholder = "Select...",
  className = '',
  style,
  disabled = false
}: SelectProps): JSX.Element {
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    onChange(newValue);
  };

  return (
    <select
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${className}`}
      style={style}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
