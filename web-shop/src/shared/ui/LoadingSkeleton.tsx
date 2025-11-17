import React from 'react';

export interface LoadingSkeletonProps {
  readonly rows?: number;
  readonly className?: string;
}

const baseContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '24px',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.4)',
  border: '1px solid rgba(148, 163, 184, 0.16)',
};

const shimmerRow: React.CSSProperties = {
  width: '100%',
  height: '14px',
  borderRadius: '999px',
  background: 'rgba(148, 163, 184, 0.24)',
};

export const LoadingSkeleton = ({ rows = 6, className }: LoadingSkeletonProps): JSX.Element => (
  <div style={baseContainer} className={className}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} style={shimmerRow} />
    ))}
  </div>
);

export const PanelSkeleton: React.FC = () => (
  <LoadingSkeleton rows={4} className="offers-panel-skeleton" />
);

export const TableSkeleton: React.FC = () => (
  <LoadingSkeleton rows={8} className="offers-table-skeleton" />
);

export default PanelSkeleton;


