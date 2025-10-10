import React from 'react';

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface LineSeries {
  id: string;
  name: string;
  color: string;
  data: SeriesPoint[];
}

interface MultiLineChartProps {
  series: LineSeries[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  fill?: boolean;
  smooth?: boolean;
  className?: string;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  series,
  title,
  height = 300,
  showGrid = true,
  showDots = true,
  fill = false,
  smooth = true,
  className = '',
}) => {
  const chartWidth = 600;
  const chartHeight = height;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 60 };

  const allPoints = series.flatMap(s => s.data);
  const maxValue = Math.max(...allPoints.map(d => d.value), 0);
  const minValue = Math.min(...allPoints.map(d => d.value), 0);
  const valueRange = Math.max(maxValue - minValue, 1);

  const labels = series[0]?.data.map(p => p.label) ?? [];
  const getX = (index: number) => {
    const availableWidth = chartWidth - chartPadding.left - chartPadding.right;
    return chartPadding.left + (index / Math.max(labels.length - 1, 1)) * availableWidth;
  };
  const getY = (value: number) => {
    const availableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const normalized = (value - minValue) / valueRange;
    return chartHeight - chartPadding.bottom - normalized * availableHeight;
  };

  const createPath = (points: {x:number;y:number}[]) => {
    if (points.length === 0) return '';
    if (!smooth) {
      return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    }
    const path = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }
    return path.join(' ');
  };

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(fraction => ({
    value: minValue + valueRange * fraction,
    y: chartHeight - chartPadding.bottom - fraction * (chartHeight - chartPadding.top - chartPadding.bottom),
  }));

  return (
    <div className={`flex flex-col ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <svg width={chartWidth} height={chartHeight} className="overflow-visible">
        {showGrid && (
          <g>
            {gridLines.map((line, index) => (
              <g key={index}>
                <line x1={chartPadding.left} y1={line.y} x2={chartWidth - chartPadding.right} y2={line.y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={chartPadding.left - 10} y={line.y + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {line.value.toLocaleString()}
                </text>
              </g>
            ))}
            {labels.map((label, i) => {
              const showLabel = i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0;
              if (!showLabel) return null;
              return (
                <text key={i} x={getX(i)} y={chartHeight - chartPadding.bottom + 20} textAnchor="middle" className="text-xs fill-gray-500">
                  {label}
                </text>
              );
            })}
          </g>
        )}

        {series.map(s => {
          const points = s.data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
          const linePath = createPath(points);
          const areaPath = fill ? `${linePath} L ${points[points.length - 1]?.x ?? 0} ${chartHeight - chartPadding.bottom} L ${points[0]?.x ?? 0} ${chartHeight - chartPadding.bottom} Z` : '';
          return (
            <g key={s.id}>
              {fill && areaPath && <path d={areaPath} fill={s.color} fillOpacity="0.08" />}
              <path d={linePath} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {showDots && points.map((p, i) => (
                <circle key={`${s.id}-${i}`} cx={p.x} cy={p.y} r="3" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {series.map(s => (
          <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded" style={{ background: s.color }} />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};




