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
  // Проверяем, есть ли уже flex flex-col в className (с ! или без)
  const hasFlexCol = (className.includes('flex') || className.includes('!flex')) && 
                     (className.includes('flex-col') || className.includes('!flex-col'));
  
  const containerClasses = vertical 
    ? sidebar 
      ? hasFlexCol 
        ? `w-64 gap-2 ${className}`.replace(/\s+/g, ' ').trim()
        : `!flex !flex-col w-64 gap-2 ${className}`.replace(/\s+/g, ' ').trim()
      : hasFlexCol 
        ? `gap-2 ${className}`.replace(/\s+/g, ' ').trim()
        : `!flex !flex-col gap-2 ${className}`.replace(/\s+/g, ' ').trim()
    : className;
    
  return (
    <aside className={containerClasses} style={style}>
      {children}
    </aside>
  );
}

    