'use client';

import React from 'react';
import type { DailyRewardListItemViewModel } from '../../presenters/daily-rewards-list.presenter';

export interface DailyRewardListItemProps {
  reward: DailyRewardListItemViewModel;
}

export function DailyRewardListItem({
  reward,
}: DailyRewardListItemProps): JSX.Element {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        background: 'rgba(15, 23, 42, 0.5)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with icon and status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>
              {reward.typeIcon}
            </span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                background: reward.statusBadge.backgroundColor,
                color: reward.statusBadge.color,
              }}
            >
              {reward.statusBadge.text}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
          color: '#F8FAFC'
        }}>
          {reward.title}
        </h3>

        {/* Description */}
        <p style={{
          color: '#94A3B8',
          fontSize: '14px',
          marginBottom: '16px',
          flex: 1,
          lineHeight: '1.4'
        }}>
          {reward.description}
        </p>

        {/* Points */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#60A5FA'
          }}>
            {reward.points} points
          </div>
        </div>
      </div>
    </div>
  );
}
