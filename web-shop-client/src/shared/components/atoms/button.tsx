'use client';

import type { ReactNode, CSSProperties } from 'react';

export interface UniversalButtonProps {
  readonly text?: string;
  readonly icon?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly children?: ReactNode;
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
  readonly loadingText?: string;
  readonly [key: string]: unknown; }

export function UniversalButton({
  text,
  icon,
  className = '',
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
  fullWidth = false,
  isLoading = false,
  loadingText = 'Loading...',
  ...restProps
}: UniversalButtonProps): JSX.Element {
  const getJustifyClass = () => {
    if (style?.justifyContent === 'flex-start') return 'justify-start';
    if (style?.justifyContent === 'flex-end') return 'justify-end';
    return 'justify-center';
  };
  
  const justifyClass = getJustifyClass();
  
  const buttonClasses = fullWidth 
    ? `w-full flex items-center ${justifyClass} rounded-lg ${className}`.trim()
    : className;
    
  const { justifyContent, ...styleWithoutJustify } = style || {};
    
  const buttonStyle = fullWidth 
    ? { 
        ...styleWithoutJustify, 
        height: style?.height || 'auto', 
        minHeight: style?.minHeight || '40px', 
        maxHeight: style?.maxHeight || '48px' 
      }
    : style;
    
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const displayText = isLoading ? loadingText : (text || children);
  const displayIcon = isLoading ? null : icon;
  
  return (
    <button 
      type="button" 
      className={buttonClasses} 
      style={buttonStyle} 
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isLoading}
      {...restProps}
    >
      {isLoading && (
        <span className="mr-2 inline-block animate-spin">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {displayIcon && <span className="mr-2">{displayIcon}</span>}
      {displayText}
    </button>
  );
} 