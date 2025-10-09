import React from 'react';

export interface StackedPoint {
  label: string;
  segments: { id: string; name: string; color: string; value: number }[];
}

interface StackedAreaChartProps {
  data: StackedPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

export const StackedAreaChart: React.FC<StackedAreaChartProps> = ({
  data,
  title,
  height = 300,
  showGrid = true,
  className = '',
}) => {
  const chartWidth = 600;
  const chartHeight = height;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };

  const labels = data.map(d => d.label);
  const segments = Array.from(new Set(data.flatMap(d => d.segments.map(s => s.id))));
  const segmentMeta = new Map<string, { name: string; color: string }>();
  data.forEach(d => d.segments.forEach(s => segmentMeta.set(s.id, { name: s.name, color: s.color })));

  const totals = data.map(d => d.segments.reduce((sum, s) => sum + s.value, 0));
  const maxTotal = Math.max(...totals, 1);

  const getX = (i: number) => pad.left + (i / Math.max(labels.length - 1, 1)) * (chartWidth - pad.left - pad.right);
  const getY = (v: number) => chartHeight - pad.bottom - (v / maxTotal) * (chartHeight - pad.top - pad.bottom);

  // Build stacked paths
  const cumulativeBySegment = (segmentId: string) => {
    const values = data.map(d => d.segments.find(s => s.id === segmentId)?.value ?? 0);
    return values;
  };

  const cumulativeStacks: Record<string, number[]> = {};
  segments.forEach(seg => { cumulativeStacks[seg] = cumulativeBySegment(seg); });

  const cumulativeAt = (index: number, uptoSegIndex: number) => {
    let sum = 0;
    for (let s = 0; s <= uptoSegIndex; s++) {
      sum += cumulativeStacks[segments[s]][index] || 0;
    }
    return sum;
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <svg width={chartWidth} height={chartHeight} className="overflow-visible">
        {showGrid && (
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((f, idx) => (
              <line key={idx} x1={pad.left} y1={getY(maxTotal * f)} x2={chartWidth - pad.right} y2={getY(maxTotal * f)} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            {labels.map((label, i) => {
              const show = i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0;
              if (!show) return null;
              return (
                <text key={i} x={getX(i)} y={chartHeight - pad.bottom + 20} textAnchor="middle" className="text-xs fill-gray-500">{label}</text>
              );
            })}
          </g>
        )}

        {segments.map((segId, segIndex) => {
          const color = segmentMeta.get(segId)?.color || '#3b82f6';
          const upper = data.map((_, i) => cumulativeAt(i, segIndex));
          const lower = data.map((_, i) => cumulativeAt(i, segIndex - 1));

          const upperPoints = upper.map((v, i) => ({ x: getX(i), y: getY(v) }));
          const lowerPoints = lower.map((v, i) => ({ x: getX(i), y: getY(v) }));

          const path = [
            `M ${lowerPoints[0]?.x ?? 0} ${lowerPoints[0]?.y ?? 0}`,
            ...lowerPoints.slice(1).map(p => `L ${p.x} ${p.y}`),
            ...upperPoints.slice().reverse().map(p => `L ${p.x} ${p.y}`),
            'Z',
          ].join(' ');

          return <path key={segId} d={path} fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />;
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {segments.map(segId => (
          <div key={segId} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded" style={{ background: segmentMeta.get(segId)?.color }} />
            <span>{segmentMeta.get(segId)?.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


