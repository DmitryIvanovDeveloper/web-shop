import React from 'react';

export interface DonutChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartDataPoint[];
  title?: string;
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 250,
  innerRadius = 0.6,
  showLegend = true,
  showPercentages = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const innerR = radius * innerRadius;
  const strokeWidth = radius - innerR;

  let currentAngle = -90;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${radius} ${radius}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      percentage,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      )}
      
      <div className="flex items-center gap-8">
        {}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {}
            <circle
              cx={radius}
              cy={radius}
              r={radius}
              fill="#f3f4f6"
              opacity="0.3"
            />
            
            {}
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                opacity="0.9"
                className="transition-opacity hover:opacity-100"
              />
            ))}
            
            {}
            <circle
              cx={radius}
              cy={radius}
              r={innerR}
              fill="white"
            />
            
            {}
            <text
              x={radius}
              y={radius}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-gray-700"
            >
              {total.toLocaleString()}
            </text>
          </svg>
        </div>

        {}
        {showLegend && (
          <div className="flex flex-col gap-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {segment.label}
                  </div>
                  {showPercentages && (
                    <div className="text-xs text-gray-500">
                      {segment.percentage.toFixed(1)}% ({segment.value.toLocaleString()})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

