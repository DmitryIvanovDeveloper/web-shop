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
  const buttonClasses = fullWidth 
    ? `w-full flex items-center justify-start rounded-lg ${className}`
    : className;
    
  const buttonStyle = fullWidth 
    ? { ...style, height: 'auto', minHeight: '40px', maxHeight: '48px' }
    : style;
    
  return (
    <button type="button" className={buttonClasses} style={buttonStyle} onClick={onClick}>
      {icon && <span className="mr-2">{icon}</span>}
      {text || children}
    </button>
  );
ч} 