'use client';

import React, { useState, useEffect } from 'react';
import { DailyRewardCard } from './daily-reward-card';
import { DailyRewardCardSkeleton } from './daily-reward-card-skeleton';
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
    padding: '0',
  };

  // Адаптивное количество колонок на основе ширины экрана
  const getColumns = (width: number): number => {
    if (width >= 1536) return 6;
    if (width >= 1280) return 3;
    if (width >= 1024) return 3;
    if (width >= 768) return 3;
    if (width >= 480) return 2;
    return 1;
  };

  const [gridStyle, setGridStyle] = useState<React.CSSProperties>(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const columns = getColumns(width);
      // На широких экранах ограничиваем максимальную ширину карточек
      const maxCardWidth = width >= 1920 ? '380px' : width >= 1536 ? '360px' : 'none';
      const gridTemplate = maxCardWidth 
        ? `repeat(${columns}, minmax(0, ${maxCardWidth}))`
        : `repeat(${columns}, minmax(0, 1fr))`;
      
      return {
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: '1rem',
        width: '100%',
        justifyContent: maxCardWidth ? 'center' : 'start',
      };
    }
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: '1rem',
      width: '100%',
    };
  });

  useEffect(() => {
    const updateGridStyle = () => {
      const width = window.innerWidth;
      const columns = getColumns(width);
      // На широких экранах ограничиваем максимальную ширину карточек
      const maxCardWidth = width >= 1920 ? '380px' : width >= 1536 ? '360px' : 'none';
      const gridTemplate = maxCardWidth 
        ? `repeat(${columns}, minmax(0, ${maxCardWidth}))`
        : `repeat(${columns}, minmax(0, 1fr))`;
      
      setGridStyle({
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: '1rem',
        width: '100%',
        justifyContent: maxCardWidth ? 'center' : 'start',
      });
    };

    updateGridStyle();
    window.addEventListener('resize', updateGridStyle);
    return () => window.removeEventListener('resize', updateGridStyle);
  }, []);

  // Показываем skeleton только если isLoading и нет наград (первая загрузка)
  // Если есть награда в процессе claim, показываем карточки со spinner на кнопке
  // Если награды уже загружены (rewards.length > 0), не показываем skeleton даже если isLoading
  const hasClaiming = rewards.some(r => r.isClaiming);
  const hasRewards = rewards.length > 0;
  
  // Skeleton показываем только при первой загрузке (isLoading && нет наград)
  if (isLoading && !hasClaiming && !hasRewards) {
    return (
      <div style={containerStyle}>
        <div style={gridStyle} className="daily-rewards-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <DailyRewardCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
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
      <div style={gridStyle} className="daily-rewards-grid">
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
      </div>
    </div>
  );
}
