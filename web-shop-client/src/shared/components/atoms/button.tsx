'use client';

import React, { type ReactNode, type CSSProperties } from 'react';
import { Home, ShoppingBag, Gift, Star, Newspaper, RefreshCw, PartyPopper } from 'lucide-react';

export interface UniversalButtonProps {
  readonly text?: string;
  readonly icon?: string;
  readonly iconSize?: string;
  readonly iconGap?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly children?: ReactNode;
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
  readonly loadingText?: string;
  readonly [key: string]: unknown;
}

const ICON_MAP: Record<string, ReactNode> = {
  // String identifier mappings (from lucide-react)
  home: <Home className="w-4 h-4" />,
  store: <ShoppingBag className="w-4 h-4" />,
  newspaper: <Newspaper className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
  refreshCw: <RefreshCw className="w-4 h-4" />,
  partyPopper: <PartyPopper className="w-4 h-4" />,
  // Legacy mappings (for backward compatibility)
  patchNotes: <Newspaper className="w-4 h-4" />,
  dailyRewards: <Gift className="w-4 h-4" />,
  loyaltyProgram: <Star className="w-4 h-4" />,
  news: <Newspaper className="w-4 h-4" />,
  updates: <RefreshCw className="w-4 h-4" />,
  events: <PartyPopper className="w-4 h-4" />,
};

export function UniversalButton({
  text,
  icon,
  iconSize,
  iconGap,
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
  
  // Determine flex direction from style or default to row
  const flexDirection = style?.flexDirection || 'row';
  const isVertical = flexDirection === 'column';
  
  // Build base classes - use flex only when needed, rely on inline styles for flexDirection
  const needsFlex = fullWidth || style?.flexDirection;
  const baseFlexClasses = needsFlex 
    ? `flex items-center ${justifyClass}`.trim()
    : '';
  
  const buttonClasses = fullWidth 
    ? `w-full ${baseFlexClasses} rounded-lg ${className}`.trim()
    : (needsFlex ? `${baseFlexClasses} ${className}`.trim() : className);
    
  const { justifyContent, ...styleWithoutJustify } = style || {};
    
  // Always include flexDirection in inline styles if it exists, and set display: flex
  const buttonStyle = fullWidth 
    ? { 
        ...styleWithoutJustify, 
        height: style?.height || 'auto', 
        minHeight: style?.minHeight || '40px', 
        maxHeight: style?.maxHeight || '48px',
        display: needsFlex ? 'flex' : (style?.display || undefined),
        flexDirection: style?.flexDirection || undefined,
      }
    : {
        ...styleWithoutJustify,
        display: needsFlex ? 'flex' : (style?.display || undefined),
        flexDirection: style?.flexDirection || undefined,
      };
    
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const displayText = isLoading ? loadingText : (text || children);

  // Determine icon size - use prop or default to 16px (w-4 h-4)
  // Note: iconSize should come as a prop, not from style (style contains compiled CSS properties)
  const resolvedIconSize = iconSize || '16px';
  const iconSizeStyle: React.CSSProperties = { width: resolvedIconSize, height: resolvedIconSize };
  
  // For Tailwind classes, use a default if custom size is provided
  const getIconClassName = () => {
    if (resolvedIconSize === '12px') return 'w-3 h-3';
    if (resolvedIconSize === '16px') return 'w-4 h-4';
    if (resolvedIconSize === '20px') return 'w-5 h-5';
    if (resolvedIconSize === '24px') return 'w-6 h-6';
    if (resolvedIconSize === '32px') return 'w-8 h-8';
    return ''; // Use inline style for custom sizes
  };
  
  const iconClassName = getIconClassName();

  let displayIcon: ReactNode = null;
  if (!isLoading && icon) {
    if (icon.startsWith('data:image') || icon.startsWith('http')) {
      displayIcon = (
        <img 
          src={icon} 
          alt="" 
          className={iconClassName || undefined}
          style={iconClassName ? undefined : iconSizeStyle}
        />
      );
    } else {
      // Check if it's a Lucide icon identifier
      const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
        home: Home,
        store: ShoppingBag,
        newspaper: Newspaper,
        gift: Gift,
        star: Star,
        refreshCw: RefreshCw,
        partyPopper: PartyPopper,
        patchNotes: Newspaper,
        dailyRewards: Gift,
        loyaltyProgram: Star,
        news: Newspaper,
        updates: RefreshCw,
        events: PartyPopper,
      };
      
      const IconComponent = iconMap[icon];
      if (IconComponent) {
        // Use cloneElement to apply size to the icon component
        displayIcon = React.createElement(IconComponent, {
          className: iconClassName || undefined,
          style: iconClassName ? undefined : iconSizeStyle,
        });
      } else {
        displayIcon = icon;
      }
    }
  }
  
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
      {displayIcon && (
        <span 
          className="flex items-center"
          style={{
            ...(isVertical 
              ? { marginBottom: iconGap || '4px' }
              : { marginRight: iconGap || '8px' }
            )
          }}
        >
          {displayIcon}
        </span>
      )}
      {displayText}
    </button>
  );
} 