'use client';

import type { CSSProperties } from 'react';

export interface BadgeProps {
  readonly text?: string;
  readonly variant?: 'discount' | 'limit' | 'timer' | 'rarity';
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
  const variantStyles: Record<string, { bg: string; text: string; skew: string }> = {
    discount: { 
      bg: '#FF4500', 
      text: 'text-white',
      skew: '#FF4500'
    },
    limit: { 
      bg: '#4169E1', 
      text: 'text-white',
      skew: '#4169E1'
    },
    timer: { 
      bg: '#FFD700', 
      text: 'text-black',
      skew: '#FFD700'
    },
    rarity: { 
      bg: '#8A2BE2', 
      text: 'text-white',
      skew: '#8A2BE2'
    },
  };

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

  // Regular badge without skew
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold ${currentVariant.text} ${className}`} 
         style={{ backgroundColor: currentVariant.bg, ...style }}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </div>
  );
}

