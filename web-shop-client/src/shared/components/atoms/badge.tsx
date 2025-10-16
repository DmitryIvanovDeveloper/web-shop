'use client';

import type { CSSProperties } from 'react';

export interface BadgeProps {
  readonly text?: string;
  readonly variant?: 'discount' | 'limit' | 'timer' | 'rarity';
  readonly icon?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Badge({ 
  text = '', 
  variant = 'discount', 
  icon, 
  className = '', 
  style 
}: BadgeProps): JSX.Element {
  const variantStyles: Record<string, string> = {
    discount: 'bg-red-500 text-white px-2 py-1 rounded-sm text-sm font-bold',
    limit: 'bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold',
    timer: 'bg-black text-white px-2 py-1 rounded-sm text-xs',
    rarity: 'bg-red-500 text-white px-2 py-1 rounded-sm text-xs',
  };

  return (
    <div className={`inline-flex items-center ${variantStyles[variant]} ${className}`} style={style}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </div>
  );
}

