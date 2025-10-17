'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface GridProps {
  readonly columns?: number;
  readonly gap?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

export function Grid({ 
  columns = 4, 
  gap = 4, 
  className = '', 
  style, 
  children 
}: GridProps): JSX.Element {
  // Проверяем, есть ли flex классы в className
  const isFlexLayout = className.includes('flex');
  
  return (
    <div 
      className={isFlexLayout ? `w-full ${className}` : `grid w-full gap-${gap} ${className}`}
      style={isFlexLayout ? style : { 
        gridTemplateColumns: `repeat(auto-fill, 270px)`,
        justifyContent: 'start',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

