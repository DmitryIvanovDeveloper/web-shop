'use client';

import type { CSSProperties } from 'react';
  import { useBadgeStyles } from '../../hooks/use-badge-styles';

export interface BadgeProps {
  readonly text?: string;
  readonly variant?: 'discount' | 'limit' | 'timer' | 'rarity' | 'purchased';
  readonly icon?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly height?: number;
  readonly withSkew?: boolean;
}

export function Badge({ 
  text = '', 
  variant = 'discount', 
  icon, 
  className = '', 
  style,
  height = 24,
  withSkew = false
}: BadgeProps): JSX.Element {
    const variantStyles = useBadgeStyles();

  const currentVariant = variantStyles[variant];
  const heightClass = `h-[${height}px]`;

  if (withSkew) {
    const isRightAligned = variant === 'limit';
    
    return (
      <div className={`flex max-w-full flex-col gap-0.5 ${className}`} >
        <div className={`relative  flex ${isRightAligned ? 'flex-row-reverse' : ''}`}>
          <div 
            className={`relative flex  ${heightClass} w-fit max-w-full min-w-[48px] items-center justify-center align-middle ${
              isRightAligned ? 'rounded-r-[calc(6px-2px)] pr-2' : 'rounded-l-[calc(6px-2px)] pl-2'
            } ${currentVariant.text}`}
            style={{ backgroundColor: currentVariant.bg, ...style }}
          >
            <div className="z-10  flex max-w-full justify-center text-xs font-bold text-nowrap whitespace-nowrap uppercase">
              {icon && <span className="mr-1">{icon}</span>}
              {text}
            </div>
            <div 
              className={`absolute z-0 ${heightClass} w-3 -skew-x-12 ${
                isRightAligned ? '-left-1.5 rounded-l-[calc(6px-1px)]' : '-right-1.5 rounded-r-[calc(6px-1px)]'
              }`}
              style={{ backgroundColor: currentVariant.skew }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold ${currentVariant.text} ${className}`} 
         style={{ backgroundColor: currentVariant.bg, ...style }}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </div>
  );
}

