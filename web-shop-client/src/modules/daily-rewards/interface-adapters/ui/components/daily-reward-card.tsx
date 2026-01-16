'use client';

import React from 'react';

export interface DailyRewardCardProps {
  title: string;
  description: string;
  points: number;
  type: 'points' | 'currency' | 'item';
  isActive: boolean;
  isClaimedToday?: boolean;
  onClaim?: () => void;
  day?: number; // Номер дня (1, 2, 3, ...)
}

function getTypeBadge(type: DailyRewardCardProps['type']): { label: string; color: string } {
  switch (type) {
    case 'points':
      return { label: 'Points', color: '#60A5FA' };
    case 'currency':
      return { label: 'Currency', color: '#F59E0B' };
    case 'item':
      return { label: 'Item', color: '#A855F7' };
  }
}

export function DailyRewardCard({
  title,
  description,
  points,
  type,
  isActive,
  isClaimedToday = false,
  onClaim,
  day,
}: DailyRewardCardProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '220px',
    minHeight: '160px',
    backgroundColor: '#0B1220',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
    border: isActive ? '1px solid rgba(96, 165, 250, 0.55)' : '1px solid rgba(148, 163, 184, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: '14px',
    textAlign: 'left',
    position: 'relative',
    opacity: isActive ? 1 : 0.75,
  };

  const badge = getTypeBadge(type);

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: `1px solid ${badge.color}55`,
    color: '#E2E8F0',
    fontSize: '12px',
    fontWeight: 700,
  };

  const titleStyle: React.CSSProperties = {
    marginTop: '10px',
    fontSize: '16px',
    fontWeight: 800,
    color: '#F8FAFC',
    lineHeight: 1.2,
  };

  const descriptionStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.3,
  };

  const pointsRowStyle: React.CSSProperties = {
    marginTop: '14px',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
  };

  const pointsStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 900,
    color: badge.color,
  };

  const dayLabelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '14px',
    left: '14px',
    fontSize: '14px',
    fontWeight: 900,
    color: '#FBBF24',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    letterSpacing: '0.5px',
  };

  const activePillStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.12)',
    border: isActive ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(148, 163, 184, 0.25)',
    color: isActive ? '#34D399' : '#CBD5E1',
  };

  const claimButtonStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#60A5FA' : '#64748B',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    cursor: isActive && onClaim ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    opacity: isActive ? 1 : 0.6,
  };

  return (
    <div style={cardStyle}>
      {day !== undefined && (
        <div style={dayLabelStyle}>DAY {day}</div>
      )}
      <div>
        <span style={badgeStyle}>{badge.label}</span>
        <div style={titleStyle}>{title}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>

      <div style={pointsRowStyle}>
        <div style={pointsStyle}>{points}</div>
        <div style={activePillStyle}>{isActive ? 'Active' : 'Inactive'}</div>
      </div>

      {onClaim && !isClaimedToday && (
        <button
          style={claimButtonStyle}
          onClick={onClaim}
          disabled={!isActive}
          onMouseEnter={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#3B82F6';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#60A5FA';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isActive ? '🎁 Claim Reward' : 'Not Available'}
        </button>
      )}

      {isClaimedToday && (
        <div style={{
          ...claimButtonStyle,
          backgroundColor: '#10B981',
          cursor: 'default',
          opacity: 1
        }}>
          ✅ Already claimed today
        </div>
      )}
    </div>
  );
}
