'use client';

import type { ReactNode, CSSProperties } from 'react';

export interface UniversalContainerProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly vertical?: boolean;
  readonly sidebar?: boolean;
}

export function UniversalContainer({
  className = '',
  style,
  children,
  vertical = false,
  sidebar = false,
}: UniversalContainerProps): JSX.Element {
  const containerClasses = vertical 
    ? sidebar 
      ? `flex flex-col w-64 gap-2 ${className}`
      : `flex flex-col gap-2 ${className}`
    : className;
    
  return (
    <aside className={containerClasses} style={style}>
      {children}
    </aside>
  );
}

    