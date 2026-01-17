'use client';

import React from 'react';

export interface DailyRewardCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function DailyRewardCardSkeleton({
  className = '',
  style,
}: DailyRewardCardSkeletonProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '160px',
    backgroundColor: '#0B1220',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: '14px',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
    opacity: 1,
    boxSizing: 'border-box',
    ...style
  };

  // Shimmer animation
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
        {/* Shimmer overlay */}
        <div style={shimmerStyle} />

        {/* Day label skeleton */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            ...skeletonBaseStyle,
            width: '50px',
            height: '18px',
          }}
        />

        <div>
          {/* Badge skeleton */}
          <div
            style={{
              ...skeletonBaseStyle,
              display: 'inline-block',
              width: '80px',
              height: '28px',
              borderRadius: '999px',
            }}
          />

          {/* Title skeleton */}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '140px',
              height: '20px',
              marginTop: '10px',
            }}
          />

          {/* Description skeleton */}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '100%',
              height: '14px',
              marginTop: '8px',
              marginBottom: '4px',
            }}
          />
          <div
            style={{
              ...skeletonBaseStyle,
              width: '80%',
              height: '14px',
            }}
          />
        </div>

        {/* Points row skeleton */}
        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          {/* Points skeleton */}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '60px',
              height: '28px',
            }}
          />

          {/* Active pill skeleton */}
          <div
            style={{
              ...skeletonBaseStyle,
              width: '70px',
              height: '28px',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Button skeleton */}
        <div
          style={{
            ...skeletonBaseStyle,
            marginTop: '16px',
            width: '100%',
            height: '44px',
            borderRadius: '8px',
          }}
        />
      </div>
    </>
  );
}


