'use client';

import React from 'react';
import { ClipLoader } from 'react-spinners';

export interface DailyRewardCardProps {
  title: string;
  description: string;
  points: number;
  type: 'points' | 'currency' | 'item';
  isActive: boolean;
  isClaimedToday?: boolean;
  shouldShowPadlock?: boolean;
  onClaim?: () => void;
  day?: number;
  isLoading?: boolean;
  timeUntilNextClaim?: string | null;
  labels?: {
    claimButton?: string;
    claimedButton?: string;
    claiming?: string;
    dayPrefix?: string;
    active?: string;
    inactive?: string;
    points?: string;
    currency?: string;
    item?: string;
  };
}

function getTypeBadge(type: DailyRewardCardProps['type'], labels?: DailyRewardCardProps['labels']): { label: string; color: string } {
  switch (type) {
    case 'points':
      return { label: labels?.points || 'Points', color: '#60A5FA' };
    case 'currency':
      return { label: labels?.currency || 'Currency', color: '#F59E0B' };
    case 'item':
      return { label: labels?.item || 'Item', color: '#A855F7' };
  }
}

export function DailyRewardCard({
  title,
  description,
  points,
  type,
  isActive,
  isClaimedToday = false,
  shouldShowPadlock = false,
  onClaim,
  day,
  isLoading = false,
  timeUntilNextClaim = null,
  labels,
}: DailyRewardCardProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '100%',
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
    opacity: 1,
    boxSizing: 'border-box',
  };

  const badge = getTypeBadge(type, labels);

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
    right: '14px',
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
    backgroundColor: isActive ? '#60A5FA' : timeUntilNextClaim ? '#374151' : '#1E293B',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    cursor: isActive && onClaim && !isLoading ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    opacity: isActive && !isLoading ? 1 : 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '44px',
  };

  return (
    <div style={cardStyle}>
      {day !== undefined && (
        <div style={dayLabelStyle}>{labels?.dayPrefix || 'DAY'} {day}</div>
      )}
      <div>
        <span style={badgeStyle}>{badge.label}</span>
        <div style={titleStyle}>{title}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>

      <div style={pointsRowStyle}>
        <div style={pointsStyle}>{points}</div>
        <div style={activePillStyle}>{isActive ? (labels?.active || 'Active') : (labels?.inactive || 'Inactive')}</div>
      </div>

      {!isClaimedToday && (isActive || shouldShowPadlock || timeUntilNextClaim) && (
        <button
          type="button"
          style={claimButtonStyle}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isActive && !isLoading && onClaim) {
              onClaim();
            }
          }}
          disabled={!isActive || isLoading || !onClaim}
          onMouseEnter={(e) => {
            if (isActive && !isLoading) {
              e.currentTarget.style.backgroundColor = '#3B82F6';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (isActive && !isLoading) {
              e.currentTarget.style.backgroundColor = '#60A5FA';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isLoading ? (
            <>
              <ClipLoader size={14} color="#FFFFFF" loading={true} />
              <span>{labels?.claiming || 'Claiming...'}</span>
            </>
          ) : isActive ? (
            <>
              <span>🎁</span>
              <span>{labels?.claimButton || 'Claim Reward'}</span>
            </>
          ) : timeUntilNextClaim ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94A3B8',
              fontSize: '14px',
              fontWeight: 600
            }}>
              <span>⏰</span>
              <span>{timeUntilNextClaim}</span>
            </div>
          ) : shouldShowPadlock ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.7 }}
            >
              <path
                d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </button>
      )}

      {isClaimedToday && (
        <div style={{
          ...claimButtonStyle,
          backgroundColor: '#363949',
          color: '#8C8C8C',
          cursor: 'default',
          opacity: 1,
          fontWeight: 700,
        }}>
          <div>{labels?.claimedButton || 'Claimed'}</div>
          {timeUntilNextClaim && (
            <div style={{
              fontSize: '12px',
              marginTop: '4px',
              opacity: 0.8,
              fontWeight: 400,
            }}>
              Next: {timeUntilNextClaim}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
