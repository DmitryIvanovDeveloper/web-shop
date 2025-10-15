'use client';

import type { ReactNode, CSSProperties } from 'react';

export interface UniversalContainerProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly vertical?: boolean;
}

export function UniversalContainer({
  className = '',
  style,
  children,
  vertical = false,
}: UniversalContainerProps): JSX.Element {
  const containerClasses = vertical 
    ? `flex flex-col min-h-screen w-64 gap-2 ${className}`
    : className;
    
  return (
    <aside className={containerClasses} style={style}>
      {children}
    </aside>
  );
}

    