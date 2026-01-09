'use client';

import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../../src/shared/ui/EmptyState';
import { LoadingSkeleton } from '../../../../src/shared/ui/LoadingSkeleton';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
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

export default function DailyRewardsPage({ searchParams }: PageProps): JSX.Element {
  const params = React.use(searchParams);
  const router = useRouter();
  const appId = params?.appId;

  // Always call hooks first, in the same order
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);

  const loadRewards = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/merchant-admin/daily-rewards?appId=${appId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const data = await response.json();
      setRewards(data);
    } catch (err) {
      setError('Failed to load daily rewards');
      console.error('Error loading rewards:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Redirect to projects page if appId is missing (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    if (!appId) {
      router.push('/projects');
    }
  }, [appId, router]);

  useEffect(() => {
    // Defer data loading to avoid blocking navigation
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => loadRewards());
    } else {
      setTimeout(() => loadRewards(), 0);
    }
  }, [appId, loadRewards]);

  useEffect(() => {
    // Defer data loading to avoid blocking navigation
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => loadRewards());
    } else {
      setTimeout(() => loadRewards(), 0);
    }
  }, [params.appId, loadRewards]);

  const handleCreateReward = async (formData: FormData): Promise<void> => {
    try {
      const data = {
        appId,
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        points: parseInt(formData.get('points') as string),
      };

      const response = await fetch('/api/merchant-admin/daily-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create reward');
      }

      setShowCreateForm(false);
      loadRewards();
    } catch (err) {
      setError('Failed to create reward');
      console.error('Error creating reward:', err);
    }
  };

  const handleEditReward = (reward: any): void => {
    setEditingReward(reward);
  };

  const handleUpdateReward = async (formData: FormData): Promise<void> => {
    if (!editingReward) return;

    try {
      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        points: parseInt(formData.get('points') as string),
        is_active: formData.get('isActive') === 'true',
      };

      const response = await fetch(`/api/merchant-admin/daily-rewards/${editingReward.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update reward');
      }

      setEditingReward(null);
      loadRewards();
    } catch (err) {
      setError('Failed to update reward');
      console.error('Error updating reward:', err);
    }
  };

  const handleDeleteReward = async (rewardId: string): Promise<void> => {
    // Temporarily remove confirm for testing
    // if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch(`/api/merchant-admin/daily-rewards/${rewardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reward');
      }

      loadRewards();
    } catch (err) {
      setError('Failed to delete reward');
      console.error('Error deleting reward:', err);
    }
  };

  // useLayoutEffect handles redirect, no conditional return needed

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
          <button style={headerButtonStyle} onClick={loadRewards}>
            🔄 Refresh
          </button>
          <button
            style={{
              ...headerButtonStyle,
              background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
              border: '1px solid rgba(96, 165, 250, 0.45)',
            }}
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Add Reward
          </button>
        </div>
      </header>

      <div style={{ marginTop: '24px', flexGrow: 1, overflow: 'hidden' }}>
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              minWidth: '400px',
            }}>
              <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
                Create Daily Reward
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleCreateReward(formData);
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  >
                    <option value="points">Points</option>
                    <option value="currency">Currency</option>
                    <option value="item">Item</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                      minHeight: '60px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Points
                  </label>
                  <input
                    name="points"
                    type="number"
                    min="1"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'transparent',
                      color: '#E2E8F0',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingReward && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              minWidth: '400px',
            }}>
              <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
                Edit Daily Reward
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleUpdateReward(formData);
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingReward.title}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    defaultValue={editingReward.description}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                      minHeight: '60px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Points
                  </label>
                  <input
                    name="points"
                    type="number"
                    min="1"
                    required
                    defaultValue={editingReward.points}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#E2E8F0' }}>
                    Status
                  </label>
                  <select
                    name="isActive"
                    defaultValue={editingReward.is_active ? 'true' : 'false'}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#E2E8F0',
                    }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditingReward(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'transparent',
                      color: '#E2E8F0',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                        onClick={() => handleEditReward(reward)}
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
                        onClick={() => handleDeleteReward(reward.id)}
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
