import React from 'react';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  height?: number;
  showValues?: boolean;
  showGrid?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  showValues = true,
  showGrid = true,
  horizontal = false,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = height - 60; // Reserve space for labels
  const chartWidth = data.length * 80;
  const barWidth = 50;
  const barSpacing = 30;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      )}
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={height} className="mx-auto">
          {/* Grid lines */}
          {showGrid && (
            <g className="grid-lines">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = chartHeight - chartHeight * ratio + 20;
                return (
                  <g key={index}>
                    <line
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={-10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {(maxValue * ratio).toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = index * (barWidth + barSpacing) + barSpacing;
            const y = chartHeight - barHeight + 20;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx="4"
                  className="transition-opacity hover:opacity-80"
                />
                
                {/* Value label */}
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-sm font-medium fill-gray-700"
                  >
                    {item.value.toLocaleString()}
                  </text>
                )}
                
                {/* Category label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};


