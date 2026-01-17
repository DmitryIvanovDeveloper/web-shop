'use client';

import type { ReactNode, CSSProperties } from 'react';

export interface UniversalContainerProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly vertical?: boolean;
  readonly sidebar?: boolean;
  readonly gap?: string;
  readonly onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  readonly onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  readonly onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  readonly [key: string]: unknown; // Allow data-* attributes and other props
}

export function UniversalContainer({
  className = '',
  style,
  children,
  vertical = false,
  sidebar = false,
  gap,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...restProps
}: UniversalContainerProps): JSX.Element {
  const hasFlexCol = (className.includes('flex') || className.includes('!flex')) && 
                    (className.includes('flex-col') || className.includes('!flex-col'));
  
  const containerClasses = vertical 
    ? sidebar 
      ? hasFlexCol 
        ? `w-64 ${className}`.replace(/\s+/g, ' ').trim()
        : `!flex !flex-col w-64 ${className}`.replace(/\s+/g, ' ').trim()
      : hasFlexCol 
        ? className
        : `!flex !flex-col ${className}`.replace(/\s+/g, ' ').trim()
    : className;
  
  const containerStyle: CSSProperties = {
    ...style,
    ...(vertical && { display: 'flex', flexDirection: 'column' }),
    ...(vertical && gap ? { gap } : {}),
  };
    
  return (
    <aside 
      className={containerClasses} 
      style={containerStyle}
      data-sidebar={sidebar ? 'true' : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      {...restProps}
    >
      {children}
    </aside>
  );
}
