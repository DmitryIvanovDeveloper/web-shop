'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';

export interface GridProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly minItemWidth?: string;
  readonly maxColumns?: number;
  readonly adaptive?: boolean;
  readonly mobileColumns?: number;
  readonly tabletColumns?: number;
  readonly desktopColumns?: number;
}

export function Grid({
  className = '',
  style,
  children,
  minItemWidth = '270px',
  maxColumns,
  adaptive = true,
  mobileColumns = 2,
  tabletColumns = 3,
  desktopColumns = 4
}: GridProps): JSX.Element {
  // Grid breakpoints КАК НА РЕФЕРЕНСЕ Pixel Gun Hub
  // Используем JavaScript вместо Tailwind (работает надежнее)
  const [columns, setColumns] = useState(2);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumns(4);
      } else if (width >= 1024) {
        setColumns(3);
      } else if (width >= 640) {
        setColumns(2);
      } else {
        setColumns(2);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  const gridStyle: CSSProperties = {
    display: 'grid',
    width: '100%',
    gap: '1rem',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridAutoRows: '1fr', // Все строки одинаковой высоты
    alignItems: 'stretch', // Растягиваем карточки до одинаковой высоты в строке
    ...style
  };
  
  return (
    <div
      className={`${className || ''}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
}

