'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ResponsiveLine = dynamic(
  () => import('@nivo/line').then(m => m.ResponsiveLine),
  { ssr: false }
);

export interface MiniTrendChartProps {
  data: Array<{ date: string; value: number }>;
  height?: number;
  strokeColor?: string;
  className?: string;
}

export function MiniTrendChart({
  data,
  height = 180,
  strokeColor = '#3b82f6',
  className = ''
}: MiniTrendChartProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const nivoData = useMemo(() => ([{
    id: 'sales',
    color: strokeColor,
    data: data.map(d => ({ x: d.date, y: d.value }))
  }]), [data, strokeColor]);

  if (data.length === 0) {
    return (
      <div
        className={`mini-trend-chart-empty ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}
      >
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>No data</span>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div 
        className={className} 
        style={{ 
          width: '100%', 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '4px'
        }}
      >
        <div style={{ 
          width: '80%', 
          height: '2px', 
          background: `linear-gradient(90deg, ${strokeColor} 0%, transparent 100%)`,
          borderRadius: '1px'
        }} />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Sales Trend</div>
      <ResponsiveLine
        data={nivoData}
        margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }}
        xFormat="time:%b %d"
        yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
        axisBottom={{ format: '%b %d', tickSize: 0, tickPadding: 8 }}
        axisLeft={{ tickSize: 0, tickPadding: 8, format: (v: number) => `$${Number(v).toLocaleString()}` }}
        enablePoints={true}
        pointSize={5}
        pointBorderWidth={2}
        pointBorderColor="#ffffff"
        useMesh={true}
        enableArea={true}
        areaOpacity={0.15}
        colors={[strokeColor]}
        theme={{
          axis: { ticks: { text: { fill: '#64748b', fontSize: 11 } } },
          grid: { line: { stroke: '#e2e8f0', strokeDasharray: '4 4' } },
          crosshair: { line: { stroke: '#94a3b8', strokeDasharray: '3 3' } }
        }}
        crosshairType="x"
        tooltip={({ point }) => (
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '6px 8px',
            borderRadius: 8,
            fontSize: 12,
            color: '#0f172a'
          }}>
            <div style={{ fontWeight: 600 }}>{`$${Number(point.data.y).toLocaleString()}`}</div>
            <div style={{ color: '#64748b' }}>{new Date(point.data.x as unknown as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        )}
        curve="monotoneX"
      />
    </div>
  );
}

