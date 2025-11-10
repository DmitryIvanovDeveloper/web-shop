'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode
} from 'react';

interface LayoutConfig {
  readonly mode: 'mobile' | 'tablet' | 'desktop' | 'large';
  readonly minWidth: number;
  readonly gap: string;
}

const LAYOUTS: LayoutConfig[] = [
  { mode: 'large', minWidth: 1280, gap: '1rem' },
  { mode: 'desktop', minWidth: 900, gap: '0.875rem' },
  { mode: 'tablet', minWidth: 640, gap: '0.75rem' },
  { mode: 'mobile', minWidth: 0, gap: '0.75rem' }
];

const DEFAULT_GAP = '0.75rem';

const parsePixels = (value: string): number | null => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed.endsWith('px')) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed.replace('px', ''));
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const resolveColumnsByWidth = (
  availableWidth: number,
  minItemWidth: string,
  fallback: number
): number => {
  const parsedMin = parsePixels(minItemWidth);
  if (!parsedMin || parsedMin <= 0) {
    return Math.max(1, fallback);
  }

  const computed = Math.floor(availableWidth / parsedMin);
  return Math.max(1, computed);
};

const clampColumns = (value: number, ...limits: Array<number | undefined>): number => {
  let result = Math.max(1, value);
  limits.forEach((limit) => {
    if (typeof limit === 'number' && Number.isFinite(limit)) {
      result = Math.min(result, Math.max(1, limit));
    }
  });
  return result;
};

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(() => Math.max(1, mobileColumns));
  const [gap, setGap] = useState(DEFAULT_GAP);

  const calculateLayout = useCallback(
    (width: number | undefined) => {
      if (typeof width !== 'number' || Number.isNaN(width) || width <= 0) {
        setColumns((current) => clampColumns(current, maxColumns, desktopColumns));
        setGap(DEFAULT_GAP);
        return;
      }

      const layout =
        LAYOUTS.find((config) => width >= config.minWidth) ?? LAYOUTS[LAYOUTS.length - 1];

      const layoutColumnsMap: Record<LayoutConfig['mode'], number> = {
        mobile: mobileColumns,
        tablet: tabletColumns,
        desktop: desktopColumns,
        large: desktopColumns
      };

      const desiredColumns = layoutColumnsMap[layout.mode] ?? desktopColumns;
      const columnsByWidth = resolveColumnsByWidth(width, minItemWidth, desiredColumns);
      const nextColumns = clampColumns(columnsByWidth, desiredColumns, maxColumns);

      setColumns(nextColumns);
      setGap(layout.gap ?? DEFAULT_GAP);
    },
    [desktopColumns, maxColumns, minItemWidth, mobileColumns, tabletColumns]
  );

  useEffect(() => {
    if (!adaptive) {
      const fallbackWidth = containerRef.current?.getBoundingClientRect().width;
      calculateLayout(fallbackWidth);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const target = containerRef.current;
    const applyWidth = (width: number | undefined) => {
      calculateLayout(width);
    };

    if (target && typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        applyWidth(entry?.contentRect.width ?? entry?.target?.clientWidth);
      });
      observer.observe(target);
      applyWidth(target.getBoundingClientRect().width);

      return () => {
        observer.disconnect();
      };
    }

    const handleFallbackResize = () => {
      const width = target?.getBoundingClientRect().width ?? window.innerWidth;
      applyWidth(width);
    };

    handleFallbackResize();
    window.addEventListener('resize', handleFallbackResize);

    return () => {
      window.removeEventListener('resize', handleFallbackResize);
    };
  }, [adaptive, calculateLayout]);

  const gridStyle: CSSProperties = {
    display: 'grid',
    width: '100%',
    gap,
    gridTemplateColumns: `repeat(${columns}, minmax(${minItemWidth}, 1fr))`,
    alignItems: 'stretch',
    ...style
  };

  return (
    <div ref={containerRef} className={className} style={gridStyle}>
      {children}
    </div>
  );
}
