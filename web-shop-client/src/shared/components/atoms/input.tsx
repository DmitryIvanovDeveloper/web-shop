'use client';

import React, { useState, useEffect, type CSSProperties } from 'react';

export interface InputProps {
  readonly placeholder?: string;
  readonly value?: string | number;
  readonly onChange?: (value: string | number) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  readonly disabled?: boolean;
  readonly readonly?: boolean;
}

export function Input({
  placeholder,
  value,
  onChange = () => {},
  className = '',
  style,
  type = 'text',
  disabled = false,
  readonly = false,
}: InputProps): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(() => String(value ?? ''));

  useEffect(() => {
    setInputValue(String(value ?? ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (type === 'number') {
      const numValue = parseFloat(newValue);
      onChange(!Number.isNaN(numValue) ? numValue : 0);
    } else {
      onChange(newValue);
    }
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      className={className}
      style={style}
      disabled={disabled}
      readOnly={readonly}
    />
  );
}