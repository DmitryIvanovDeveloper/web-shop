'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { EmptyState } from '../../../../../shared/ui/EmptyState';
import { LoadingSkeleton } from '../../../../../shared/ui/LoadingSkeleton';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/daily-rewards.container';
import { DailyRewardsAdminPresenter, DailyRewardViewModel } from '../presenters/daily-rewards-admin-presenter';
import type { RewardTypeValue } from '../../domain/value-objects/reward-type';

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

  const [rewards, setRewards] = useState<DailyRewardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReward, setEditingReward] = useState<DailyRewardViewModel | null>(null);

  const [formData, setFormData] = useState<{
    type: RewardTypeValue;
    title: string;
    description: string;
    points: number;
    isActive: boolean;
  }>({
    type: 'points',
    title: '',
    description: '',
    points: 0,
    isActive: true,
  });

  useEffect(() => {
    
    const unsubscribe = presenter.subscribe(() => {
      setRewards(presenter.rewards);
      setIsLoading(presenter.isLoading);
      setError(presenter.error);
    });

    loadRewards();

    return unsubscribe;
  }, [appId, presenter]);

  const loadRewards = async (): Promise<void> => {
    await presenter.loadRewards({ appId, status: 'all' });
  };

  const handleRefresh = (): void => {
    loadRewards();
  };

  const handleDeleteReward = async (rewardId: string): Promise<void> => {
    const confirmed = window.confirm('Are you sure you want to delete this reward?');
    if (confirmed) {
      await presenter.deleteReward({ id: rewardId });
    }
  };

  const handleCreateReward = (): void => {
    setShowCreateForm(true);
  };

  const handleEditReward = (reward: DailyRewardViewModel): void => {
    setEditingReward(reward);
  };

  const handleCloseModal = (): void => {
    setShowCreateForm(false);
    setEditingReward(null);
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
            onClick={handleCreateReward}
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
                          {reward.typeIcon}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{reward.title}</h3>
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
                        onClick={() => handleEditReward(reward)}
                        title="Edit reward"
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
                        onClick={() => handleDeleteReward(reward.id)}
                        title="Delete reward"
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

      {}
      {(showCreateForm || editingReward) && (
        <RewardModal
          appId={appId}
          reward={editingReward}
          presenter={presenter}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

interface RewardModalProps {
  appId: string;
  reward: DailyRewardViewModel | null;
  presenter: DailyRewardsAdminPresenter;
  onClose: () => void;
}

function RewardModal({ appId, reward, presenter, onClose }: RewardModalProps): JSX.Element {
  const [formData, setFormData] = useState<{
    type: RewardTypeValue;
    title: string;
    description: string;
    points: number;
    isActive: boolean;
  }>({
    type: (reward?.type as RewardTypeValue) || 'points',
    title: reward?.title || '',
    description: reward?.description || '',
    points: reward?.points || 0,
    isActive: reward?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = reward
        ? await presenter.updateReward({
            id: reward.id,
            ...formData,
          })
        : await presenter.createReward({
            appId,
            ...formData,
          });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: '#F8FAFC',
    fontSize: '14px',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#E2E8F0',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '12px',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#F8FAFC' }}>
          {reward ? 'Edit Reward' : 'Create New Reward'}
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Type
            <select
              style={inputStyle}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as RewardTypeValue })}
              required
            >
              <option value="points">Points 💰</option>
              <option value="currency">Currency 💎</option>
              <option value="item">Item 📦</option>
            </select>
          </label>

          <label style={labelStyle}>
            Title
            <input
              type="text"
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
              placeholder="Enter reward title"
            />
          </label>

          <label style={labelStyle}>
            Description
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              maxLength={500}
              placeholder="Enter reward description"
            />
          </label>

          <label style={labelStyle}>
            Points
            <input
              type="number"
              style={inputStyle}
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              required
              min={1}
              placeholder="Enter points value"
            />
          </label>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ ...labelStyle, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: 'rgba(156, 163, 175, 0.2)',
                color: '#9CA3AF',
                border: '1px solid rgba(156, 163, 175, 0.3)',
              }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
                color: '#F8FAFC',
                border: '1px solid rgba(96, 165, 250, 0.45)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (reward ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

