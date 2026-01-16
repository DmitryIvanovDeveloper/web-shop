'use client';

import React from 'react';
import { DailyRewardCard } from './daily-reward-card';
import { DailyRewardCardSkeleton } from './daily-reward-card-skeleton';
import { Grid } from '@/shared/components/molecules/grid';

export interface DailyRewardsCardsGridProps {
  rewards: Array<{
    id: string;
    title: string;
    description: string;
    points: number;
    type: 'points' | 'currency' | 'item';
    isActive: boolean;
    isClaimedToday?: boolean;
  }>;
  isLoading?: boolean;
  onClaimReward?: () => void;
}

export function DailyRewardsCardsGrid({ rewards, isLoading = false, onClaimReward }: DailyRewardsCardsGridProps): JSX.Element {
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    width: '100%',
    margin: '0',
    padding: '20px',
  };

  const gridStyle: React.CSSProperties = {
    justifyItems: 'start',
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <Grid
          minItemWidth="220px"
          maxColumns={6}
          style={gridStyle}
          mobileColumns={1}
          tabletColumns={2}
          desktopColumns={4}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <DailyRewardCardSkeleton key={`skeleton-${index}`} />
          ))}
        </Grid>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Grid
        minItemWidth="220px"
        maxColumns={6}
        style={gridStyle}
        mobileColumns={1}
        tabletColumns={2}
        desktopColumns={4}
      >
        {rewards.map((reward, index) => (
          <DailyRewardCard
            key={reward.id || String(index)}
            title={reward.title}
            description={reward.description}
            points={reward.points}
            type={reward.type}
            isActive={reward.isActive && !reward.isClaimedToday}
            onClaim={reward.isActive && !reward.isClaimedToday ? onClaimReward : undefined}
            day={index + 1}
          />
        ))}
      </Grid>
    </div>
  );
}
