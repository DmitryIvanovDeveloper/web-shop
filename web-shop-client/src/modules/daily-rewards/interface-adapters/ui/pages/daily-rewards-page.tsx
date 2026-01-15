'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { DAILY_REWARDS_TYPES } from '../../../infrastructure/bootstrap/types';
import { DailyRewardsListPresenter, type DailyRewardListItemViewModel } from '../../presenters/daily-rewards-list.presenter';
import { DailyRewardsCardsGrid } from '../components/daily-rewards-cards-grid';
import { useAppId } from '../../../../../shared/hooks/use-app-context';

export interface DailyRewardsPageProps {
  // appId будет получен автоматически через useAppId()
}

export function DailyRewardsPage({}: DailyRewardsPageProps): JSX.Element {
  const appId = useAppId();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || 'anonymous-user';

  const presenter = useMemo(
    () => appContainer.get<DailyRewardsListPresenter>(DAILY_REWARDS_TYPES.DailyRewardsListPresenter),
    []
  );

  // Reactive state from presenter
  const [rewards, setRewards] = useState<DailyRewardListItemViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRewards = useMemo(() => {
    return rewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      type: reward.type as 'points' | 'currency' | 'item',
      isActive: reward.isActive,
      isClaimedToday: reward.isClaimedToday,
    }));
  }, [rewards]);

  useEffect(() => {
    // Set userId in presenter
    if (userId) {
      presenter.setUserId(userId);
    }

    // Subscribe to presenter changes
    const unsubscribe = presenter.subscribe(() => {
      setRewards(presenter.rewards);
      setIsLoading(presenter.isLoading);
      setError(presenter.error);
    });

    // Initial load
    if (appId) {
      loadRewards();
    }

    // Cleanup subscription
    return unsubscribe;
  }, [appId, userId, presenter]);

  const loadRewards = async (): Promise<void> => {
    if (!appId) return;
    await presenter.loadRewards({ appId, userId });
  };

  const handleClaimReward = async (): Promise<void> => {
    if (!appId) return;
    await presenter.claimReward({ userId, appId });
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    color: '#F8FAFC',
    padding: '24px',
    boxSizing: 'border-box',
  };

  const errorStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '12px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#F87171',
    textAlign: 'center',
    marginBottom: '24px',
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(96, 165, 250, 0.2)',
    borderTop: '3px solid #60A5FA',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  };

  if (!appId) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {error && (
        <div style={errorStyle}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Oops! Something went wrong</div>
          <div>{error}</div>
        </div>
      )}

      <DailyRewardsCardsGrid 
        rewards={cardRewards} 
        isLoading={isLoading}
        onClaimReward={handleClaimReward} 
      />
    </div>
  );
}
