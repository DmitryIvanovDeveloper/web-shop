'use client';

import type { CSSProperties } from 'react';

export interface InputTextProps {
  readonly placeholder?: string;
  readonly value?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: (value: string) => void;
}

export function InputText({ 
  placeholder, 
  value = '', 
  className = '', 
  style,
  onChange 
}: InputTextProps): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <input 
      type="text"
      placeholder={placeholder}
      value={value}
      className={className}
      style={style}
      onChange={handleChange}
    />
  );
}