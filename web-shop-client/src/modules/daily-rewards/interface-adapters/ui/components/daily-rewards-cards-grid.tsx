'use client';

import React from 'react';
import { DailyRewardCard } from './daily-reward-card';
import { DailyRewardCardSkeleton } from './daily-reward-card-skeleton';
import { Grid } from '@/shared/components/molecules/grid';
import type { DailyRewardViewModel } from '../../view-models/daily-reward.view-model';

export interface DailyRewardsCardsGridProps {
  rewards: readonly DailyRewardViewModel[]; 
  isLoading?: boolean;
  onClaimReward?: (rewardId: string) => void;
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

  // Показываем skeleton только если isLoading и нет наград в процессе claim
  // Если есть награда в процессе claim, показываем карточки со spinner на кнопке
  const hasClaiming = rewards.some(r => r.isClaiming);
  if (isLoading && !hasClaiming) {
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

  // Sort rewards by dayNumber before rendering
  const sortedRewards = [...rewards].sort((a, b) => {
    // Handle null dayNumber - put them at the end
    if (a.dayNumber === null && b.dayNumber === null) return 0;
    if (a.dayNumber === null) return 1;
    if (b.dayNumber === null) return -1;
    return (a.dayNumber ?? 0) - (b.dayNumber ?? 0);
  });

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
        {sortedRewards.map((reward) => (
          <DailyRewardCard
            key={reward.id}
            title={reward.title}
            description={reward.description}
            points={reward.points}
            type={reward.type}
            isActive={reward.isActive}
            isClaimedToday={reward.isClaimedToday}
            shouldShowPadlock={reward.shouldShowPadlock()}
            onClaim={reward.shouldShowClaimButton() && onClaimReward ? () => onClaimReward(reward.id) : undefined}
            day={reward.dayNumber ?? undefined}
            isLoading={reward.isClaiming}
            timeUntilNextClaim={reward.getTimeUntilNextClaim()}
          />
        ))}
      </Grid>
    </div>
  );
}
