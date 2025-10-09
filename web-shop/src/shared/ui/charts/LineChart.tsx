import React from 'react';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  color?: string;
  fill?: boolean;
  smooth?: boolean;
  className?: string;
}

const DEFAULT_COLOR = '#3b82f6';

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 300,
  showGrid = true,
  showDots = true,
  color = DEFAULT_COLOR,
  fill = true,
  smooth = true,
  className = '',
}) => {
  const chartWidth = 600;
  const chartHeight = height;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 60 };

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue;

  const getX = (index: number) => {
    const availableWidth = chartWidth - chartPadding.left - chartPadding.right;
    return chartPadding.left + (index / (data.length - 1)) * availableWidth;
  };

  const getY = (value: number) => {
    const availableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const normalized = (value - minValue) / valueRange;
    return chartHeight - chartPadding.bottom - normalized * availableHeight;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    value: d.value,
    label: d.label,
  }));

  const createPath = () => {
    if (points.length === 0) return '';
    
    if (smooth) {
      // Catmull-Rom spline for smooth curves
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
    } else {
      return points.map((p, i) => 
        i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
      ).join(' ');
    }
  };

  const linePath = createPath();
  const areaPath = fill
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - chartPadding.bottom} L ${points[0].x} ${chartHeight - chartPadding.bottom} Z`
    : '';

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(fraction => ({
    value: minValue + valueRange * fraction,
    y: chartHeight - chartPadding.bottom - fraction * (chartHeight - chartPadding.top - chartPadding.bottom),
  }));

  return (
    <div className={`flex flex-col ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <svg
        width={chartWidth}
        height={chartHeight}
        className="overflow-visible"
      >
        {/* Grid */}
        {showGrid && (
          <g>
            {gridLines.map((line, index) => (
              <g key={index}>
                <line
                  x1={chartPadding.left}
                  y1={line.y}
                  x2={chartWidth - chartPadding.right}
                  y2={line.y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={chartPadding.left - 10}
                  y={line.y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {line.value.toLocaleString()}
                </text>
              </g>
            ))}
            
            {/* X-axis labels */}
            {data.map((d, i) => {
              const showLabel = i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0;
              if (!showLabel) return null;
              
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={chartHeight - chartPadding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {d.label}
                </text>
              );
            })}
          </g>
        )}

        {/* Area fill */}
        {fill && areaPath && (
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
          />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all"
            />
            <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};

