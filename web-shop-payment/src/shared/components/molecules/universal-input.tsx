'use client';

import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import styles from './universal-input.module.css';

export interface UniversalInputProps {
  readonly error?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly value?: string | number;
  readonly defaultValue?: string | number;
  readonly isRequired?: boolean;
  readonly disabled?: boolean;
  readonly type?: 'number' | 'password' | 'phone' | 'text' | 'email' | 'float';
  readonly bg?: 'primary' | 'secondary';
  readonly errorlink?: { title: string; path: string };
  readonly readonly?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: (value: string | number) => void;
  readonly onErrorLinkPress?: () => void;
}

export function UniversalInput({ 
  value, 
  defaultValue, 
  error, 
  label, 
  onChange = () => {}, // Дефолтный обработчик
  isRequired, 
  disabled, 
  type = 'text', 
  bg, 
  errorlink, 
  placeholder = 'Enter value', // Дефолтный placeholder
  readonly, 
  className = '',
  style,
  onErrorLinkPress 
}: UniversalInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(() => String(value ?? defaultValue ?? ''));

  useEffect(() => { 
    setInputValue(String(value ?? defaultValue ?? '')); 
  }, [value, defaultValue]);

  const handleChangeText = (text: string) => {
    setInputValue(text);
    if (type === 'number' || type === 'float') {
      const numValue = parseFloat(text);
      onChange(!Number.isNaN(numValue) ? numValue : 0);
    } else {
      onChange(text);
    }
  };

  const getInputProps = () => {
    const inputClasses = [
      styles.input,
      error ? styles['input-error'] : styles['input-normal'],
      disabled ? styles['input-disabled'] : '',
      className
    ].filter(Boolean).join(' ');

    const baseProps = { 
      value: inputValue, 
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChangeText(e.target.value),
      placeholder, 
      disabled: disabled || readonly,
      className: inputClasses,
      style
    };

    switch (type) {
      case 'email': 
        return { ...baseProps, type: 'email' as const, autoCapitalize: 'none' as const, autoCorrect: 'off' as const };
      case 'number':
      case 'float': 
        return { ...baseProps, type: 'number' as const };
      case 'phone': 
        return { ...baseProps, type: 'tel' as const };
      case 'password': 
        return { ...baseProps, type: 'password' as const };
      default: 
        return { ...baseProps, type: 'text' as const };
    }
  };

  return (
    <div className={styles['field-wrapper']}>
      {label && (
        <div className={styles['label-container']}>
          <label className={styles.label}>{label}</label>
          {isRequired && <span className={styles['required-pointer']}>*</span>}
        </div>
      )}
      <input {...getInputProps()} />
      {error && (
        <div className={styles['error-container']}>
          <span className={styles['error-text']}>{error}</span>
          {errorlink && (
            <button onClick={onErrorLinkPress} className={styles['error-link']}>
              {errorlink.title}
            </button>
          )}
        </div>
      )}
    </div>
  );
}






