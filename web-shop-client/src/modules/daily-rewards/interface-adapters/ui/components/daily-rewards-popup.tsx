'use client';

import { useState, useEffect } from 'react';
import { Popup } from '../../../../../shared/components/molecules/popup';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { DailyRewardCard } from './daily-reward-card';
import { DailyRewardCardSkeleton } from './daily-reward-card-skeleton';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { DAILY_REWARDS_TYPES } from '../../../infrastructure/bootstrap/types';
import { useAppId } from '../../../../../shared/hooks/use-app-context';
import type { DailyRewardsListPresenter } from '../../presenters/daily-rewards-list.presenter';

export interface DailyRewardsPopupProps {
  readonly userId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly autoShow?: boolean;
  readonly showDelay?: number; // milliseconds
}

export function DailyRewardsPopup({
  userId,
  isOpen,
  onClose,
  autoShow = false,
  showDelay = 2000
}: DailyRewardsPopupProps): JSX.Element | null {
  const appId = useAppId();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [presenter, setPresenter] = useState<DailyRewardsListPresenter | null>(null);
  const [rewards, setRewards] = useState<Array<{
    id: string;
    title: string;
    description: string;
    points: number;
    type: 'points' | 'currency' | 'item';
    isActive: boolean;
    isClaimedToday?: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize presenter
  useEffect(() => {
    if (!presenter && appId) {
      try {
        const presenterInstance = container.get<DailyRewardsListPresenter>(DAILY_REWARDS_TYPES.DailyRewardsListPresenter);
        if (presenterInstance) {
          setPresenter(presenterInstance);
        }
      } catch (error) {
        console.error('[DailyRewardsPopup] Failed to initialize presenter:', error);
        setError('Failed to initialize presenter');
      }
    }
  }, [presenter, appId]);

  // Subscribe to presenter changes and load rewards
  useEffect(() => {
    if (!presenter || !appId || !userId) {
      return;
    }

    presenter.setUserId(userId);

    // Subscribe to presenter changes
    const unsubscribe = presenter.subscribe(() => {
      const presenterRewards = presenter.rewards;
      const mappedRewards = presenterRewards.map((reward) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        points: reward.points,
        type: reward.type as 'points' | 'currency' | 'item',
        isActive: reward.isActive,
        isClaimedToday: reward.isClaimedToday,
      }));
      
      // Filter only active rewards that can be claimed today
      const availableRewards = mappedRewards.filter(
        reward => reward.isActive && !reward.isClaimedToday
      );
      
      setRewards(availableRewards);
      setIsLoading(presenter.isLoading);
      setError(presenter.error);
    });

    // Load rewards
    presenter.loadRewards({ appId, userId });

    return unsubscribe;
  }, [presenter, appId, userId]);

  // Auto-show logic
  useEffect(() => {
    if (autoShow && !hasShown && !isOpen) {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
        setHasShown(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, hasShown, isOpen, showDelay]);

  const handleClose = () => {
    setInternalIsOpen(false);
    onClose();
  };

  const handleClaimReward = async () => {
    if (!presenter || !appId || !userId) {
      return;
    }
    await presenter.claimReward({ userId, appId });
  };

  const actualIsOpen = isOpen || internalIsOpen;

  // Don't show popup if no rewards available (after loading completes)
  const hasAvailableRewards = rewards.some(reward => reward.isActive && !reward.isClaimedToday);

  if (!actualIsOpen || (!isLoading && !hasAvailableRewards)) {
    return null;
  }

  return (
    <Popup
      isOpen={actualIsOpen}
      onClose={handleClose}
      className="max-w-4xl w-full"
      style={{
        backgroundColor: '#1F2937',
        border: '2px solid #FBBF24',
        borderRadius: '12px',
        padding: '20px',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}
      overlayStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 100
      }}
    >
      <div className="!flex !flex-col h-full !justify-center !items-center">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">🎯 Daily Rewards</h2>
        </div>

        {/* Daily Rewards Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading || rewards.length === 0 ? (
            <Grid 
              className="justify-center" 
              minItemWidth="220px"
              maxColumns={6}
              mobileColumns={1}
              tabletColumns={2}
              desktopColumns={4}
              style={{ width: '100%', maxWidth: '100%', margin: '0 auto', justifyItems: 'start' }}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <DailyRewardCardSkeleton key={`skeleton-${index}`} />
              ))}
            </Grid>
          ) : (
            <Grid 
              className="justify-center" 
              minItemWidth="220px"
              maxColumns={6}
              mobileColumns={1}
              tabletColumns={2}
              desktopColumns={4}
              style={{ width: '100%', maxWidth: '100%', margin: '0 auto', justifyItems: 'start' }}
            >
              {rewards.map((reward, index) => (
                <div key={reward.id || `reward-${index}`} className="@container">
                  <DailyRewardCard
                    title={reward.title}
                    description={reward.description}
                    points={reward.points}
                    type={reward.type}
                    isActive={reward.isActive && !reward.isClaimedToday}
                    isClaimedToday={reward.isClaimedToday}
                    onClaim={reward.isActive && !reward.isClaimedToday ? handleClaimReward : undefined}
                    day={index + 1}
                  />
                </div>
              ))}
            </Grid>
          )}
        </div>
      </div>
    </Popup>
  );
}
