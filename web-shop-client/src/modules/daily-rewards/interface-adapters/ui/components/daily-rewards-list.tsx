'use client';

import React from 'react';
import type { DailyRewardListItemViewModel } from '../../presenters/daily-rewards-list.presenter';
import type { DailyRewardsListPresenter } from '../../presenters/daily-rewards-list.presenter';
import { DailyRewardListItem } from './daily-reward-list-item';

export interface DailyRewardsListProps {
  rewards: readonly DailyRewardListItemViewModel[];
  labels: DailyRewardsListPresenter['labels'];
}

export function DailyRewardsList({
  rewards,
  labels,
}: DailyRewardsListProps): JSX.Element {
  return (
    <div style={{
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Available Rewards</h2>
      </div>

      {rewards.length === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          {labels.noRewards}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {rewards.map((reward) => (
            <DailyRewardListItem
              key={reward.id}
              reward={reward}
            />
          ))}
        </div>
      )}
    </div>
  );
}
