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
  // Grid breakpoints и adaptive gap КАК НА РЕФЕРЕНСЕ Pixel Gun Hub
  // Используем JavaScript вместо Tailwind (работает надежнее)
  const [columns, setColumns] = useState(2);
  const [gap, setGap] = useState('1rem');
  
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      
      // Columns - 1024px включительно = 2 колонки
      if (width >= 1280) {
        setColumns(4);
        setGap('1rem'); // 16px desktop
      } else if (width > 1024) {
        setColumns(3);
        setGap('1rem'); // 16px tablet large
      } else if (width >= 640) {
        setColumns(2);
        setGap('0.75rem'); // 12px mobile/tablet
      } else {
        setColumns(2);
        setGap('0.5rem'); // 8px small mobile
      }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);
  
  const gridStyle: CSSProperties = {
    display: 'grid',
    width: '100%',
    gap, // Adaptive gap
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

