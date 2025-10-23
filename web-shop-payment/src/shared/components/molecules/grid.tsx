'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface GridProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly minItemWidth?: string;
  readonly maxColumns?: number;
  readonly adaptive?: boolean;
}

export function Grid({
  className = '',
  style,
  children,
  minItemWidth = '270px',
  maxColumns,
  adaptive = true
}: GridProps): JSX.Element {
  const gap = 2;      // Фиксированный отступ - элементы центрированы в своих ячейках

  // Проверяем, есть ли flex классы в className
  const isFlexLayout = className.includes('flex');

  // Динамическое определение gridTemplateColumns
  const getGridTemplateColumns = () => {
    if (!adaptive) {
      return `repeat(auto-fill, ${minItemWidth})`;
    }

    // Для малого количества элементов используем меньше колонок
    const childrenCount = Array.isArray(children) ? children.length : 1;

    if (childrenCount <= 2) {
      return `repeat(${Math.min(childrenCount, 2)}, 1fr)`;
    } else if (childrenCount <= 4) {
      return `repeat(${Math.min(childrenCount, 3)}, 1fr)`;
    } else {
      return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
    }
  };

  return (
    <div
      className={isFlexLayout ? `w-full ${className}` : `grid w-full gap-${gap} ${className}`}
      style={isFlexLayout ? style : {
        gridTemplateColumns: getGridTemplateColumns(),
        placeItems: 'center',
        justifyContent: 'center',
        alignItems: 'start',
        width: '100%',
        margin: '0',
        ...style
      }}
    >
      {children}
    </div>
  );
}

