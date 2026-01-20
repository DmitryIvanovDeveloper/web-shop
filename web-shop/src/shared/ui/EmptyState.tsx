import React from 'react';

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly className?: string;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center',
  background: 'rgba(15, 23, 42, 0.35)',
  border: '1px dashed rgba(148, 163, 184, 0.35)',
  color: '#E2E8F0',
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div style={containerStyle} className={className}>
      {icon && <div style={{ marginBottom: 16 }}>{icon}</div>}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: action ? 16 : 0 }}>{description}</p>
      )}
      {action}
    </div>
  );
}

