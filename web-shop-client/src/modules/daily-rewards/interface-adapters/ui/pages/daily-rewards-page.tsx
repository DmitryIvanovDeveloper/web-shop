'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { DAILY_REWARDS_TYPES } from '../../../infrastructure/bootstrap/types';
import { DailyRewardsListPresenter, type DailyRewardListItemViewModel } from '../../presenters/daily-rewards-list.presenter';
import { DailyRewardsList } from '../components/daily-rewards-list';
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
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

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

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #60A5FA, #A855F7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#94A3B8',
    fontSize: '16px',
    marginBottom: '24px',
  };

  const viewModeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    background: 'transparent',
    color: '#E2E8F0',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const viewModeButtonActiveStyle: React.CSSProperties = {
    ...viewModeButtonStyle,
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(168, 85, 247, 0.2))',
    border: '1px solid rgba(96, 165, 250, 0.6)',
  };

  const refreshButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(168, 85, 247, 0.1))',
    color: '#E2E8F0',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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

      <header style={headerStyle}>
        <h1 style={titleStyle}>
          🎯 Daily Rewards
        </h1>
        <p style={subtitleStyle}>
          Discover and collect amazing daily rewards to enhance your experience
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={viewMode === 'cards' ? viewModeButtonActiveStyle : viewModeButtonStyle}
              onClick={() => setViewMode('cards')}
            >
              📅 Cards View
            </button>
            <button
              style={viewMode === 'list' ? viewModeButtonActiveStyle : viewModeButtonStyle}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
          </div>
          <button
            style={refreshButtonStyle}
            onClick={loadRewards}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(96, 165, 250, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {error && (
        <div style={errorStyle}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Oops! Something went wrong</div>
          <div>{error}</div>
        </div>
      )}

      {isLoading ? (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p style={{ color: '#94A3B8', fontSize: '16px' }}>
            {presenter.labels.loading}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <DailyRewardsCardsGrid rewards={cardRewards} onClaimReward={handleClaimReward} />
      ) : (
        <DailyRewardsList
          rewards={rewards}
          labels={presenter.labels}
        />
      )}
    </div>
  );
}
