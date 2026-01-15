'use client';

import React from 'react';
import { DailyRewardCard } from './daily-reward-card';

export interface DailyRewardsCardsGridProps {
  rewards: Array<{
    day: number;
    multiplier: number;
  }>;
}

export function DailyRewardsCardsGrid({ rewards }: DailyRewardsCardsGridProps): JSX.Element {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
    justifyItems: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  };

  return (
    <div style={containerStyle}>
      {rewards.map((reward, index) => (
        <DailyRewardCard
          key={`${reward.day}-${index}`}
          day={reward.day}
          multiplier={reward.multiplier}
        />
      ))}
    </div>
  );
}
