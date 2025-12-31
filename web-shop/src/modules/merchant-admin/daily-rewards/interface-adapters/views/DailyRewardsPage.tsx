'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { DAILY_REWARDS_TYPES } from '../../../daily-rewards/infrastructure/bootstrap/bind.daily-rewards';
import { DailyRewardsAdminPresenter } from '../../../daily-rewards/interface-adapters/presenters/daily-rewards-admin-presenter';
import { EmptyState } from '../../../../../shared/ui/EmptyState';
import { LoadingSkeleton } from '../../../../../shared/ui/LoadingSkeleton';

export interface DailyRewardsPageProps {
  appId: string;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95) 45%), #0F172A',
  color: '#F8FAFC',
  padding: '32px',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  padding: '20px',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 24px 55px rgba(8, 15, 27, 0.45)',
  height: '100%',
  overflow: 'hidden',
};

const headerButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '12px 18px',
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
  color: '#E2E8F0',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

export function DailyRewardsPage({ appId }: DailyRewardsPageProps): JSX.Element {
  const presenter = useMemo(
    () => appContainer.get<DailyRewardsAdminPresenter>(DAILY_REWARDS_TYPES.DailyRewardsAdminPresenter),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [appId]);

  const loadRewards = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await presenter.onGetDailyRewards({ appId });
      // For now, we'll mock some data since the presenter doesn't have proper view model
      setRewards([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          app_id: 'test-app',
          type: 'points',
          title: 'Test Daily Bonus',
          description: 'Test reward for development and testing.',
          points: 100,
          is_active: true,
          created_at: '2025-12-25T15:34:00.464363+00:00',
          updated_at: '2025-12-25T15:34:00.464363+00:00'
        }
      ]);
    } catch (err) {
      setError('Failed to load daily rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = (): void => {
    loadRewards();
  };

  return (
    <div style={containerStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.2px' }}>
            Daily Rewards Management
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
            Configure and manage daily rewards for your application users
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={headerButtonStyle} onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <button
            style={{
              ...headerButtonStyle,
              background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
              border: '1px solid rgba(96, 165, 250, 0.45)',
            }}
          >
            ➕ Add Reward
          </button>
        </div>
      </header>

      <div style={{ marginTop: '24px', flexGrow: 1, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSkeleton rows={6} />
        ) : error ? (
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
            }}
          >
            {error}
          </div>
        ) : rewards.length === 0 ? (
          <EmptyState
            title="No Daily Rewards"
            description="Create your first daily reward to engage users."
          />
        ) : (
          <div style={{ ...cardStyle, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Daily Rewards</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    background: 'rgba(15, 23, 42, 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>
                          {reward.type === 'points' ? '💰' : reward.type === 'currency' ? '💎' : '📦'}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{reward.title}</h3>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            background: reward.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                            color: reward.is_active ? '#22C55E' : '#9CA3AF',
                          }}
                        >
                          {reward.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px' }}>
                        {reward.description}
                      </p>
                      <p style={{ fontSize: '14px', color: '#60A5FA' }}>
                        {reward.points} points
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          background: 'transparent',
                          color: '#E2E8F0',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#F87171',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




