'use client';

import type { ReactNode, CSSProperties } from 'react';

export interface UniversalButtonProps {
  readonly text?: string;
  readonly icon?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: () => void;
  readonly children?: ReactNode;
  readonly fullWidth?: boolean;
}

export function UniversalButton({
  text,
  icon,
  className = '',
  style,
  onClick,
  children,
  fullWidth = false,
}: UniversalButtonProps): JSX.Element {
  // Определяем justify класс на основе style.justifyContent или используем center по умолчанию
  const justifyClass = style?.justifyContent === 'flex-start' ? 'justify-start' : 'justify-center';
  
  const buttonClasses = fullWidth 
    ? `w-full flex items-center ${justifyClass} rounded-lg ${className}`
    : className;
    
  const buttonStyle = fullWidth 
    ? { 
        ...style, 
        height: style?.height || 'auto', 
        minHeight: style?.minHeight || '40px', 
        maxHeight: style?.maxHeight || '48px' 
      }
    : style;
    
  const handleClick = () => {
    console.log('[UniversalButton] Button clicked:', text);
    console.log('[UniversalButton] onClick handler exists:', !!onClick);
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <button type="button" className={buttonClasses} style={buttonStyle} onClick={handleClick}>
      {icon && <span className="mr-2">{icon}</span>}
      {text || children}
    </button>
  );
} 