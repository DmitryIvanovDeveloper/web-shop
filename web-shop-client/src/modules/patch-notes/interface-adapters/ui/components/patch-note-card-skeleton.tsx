'use client';

import React from 'react';

export interface PatchNoteCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PatchNoteCardSkeleton({
  className = '',
  style,
}: PatchNoteCardSkeletonProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '200px',
    backgroundColor: '#0B1220',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

    const shimmerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    animation: 'shimmer 2s infinite',
    zIndex: 1,
    pointerEvents: 'none',
  };

  const skeletonBaseStyle: React.CSSProperties = {
    backgroundColor: '#1E293B',
    borderRadius: '6px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={cardStyle} className={className}>
        {}
        <div style={shimmerStyle} />

        <div>
          {}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '80px',
              height: '28px',
              marginBottom: '12px',
            }}
          />

          {}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '180px',
              height: '22px',
              marginBottom: '10px',
            }}
          />

          {}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '100%',
              height: '14px',
              marginBottom: '6px',
            }}
          />
          <div
            style={{
              ...skeletonBaseStyle,
              width: '90%',
              height: '14px',
              marginBottom: '6px',
            }}
          />
          <div
            style={{
              ...skeletonBaseStyle,
              width: '75%',
              height: '14px',
            }}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          {}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '100%',
              height: '32px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              ...skeletonBaseStyle,
              width: '100%',
              height: '32px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              ...skeletonBaseStyle,
              width: '85%',
              height: '32px',
            }}
          />
        </div>
      </div>
    </>
  );
}

