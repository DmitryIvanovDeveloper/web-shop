'use client';

import { useEffect, useState, useCallback } from 'react';
import { DailyRewardsPresenter } from '../../../index';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { DAILY_REWARDS_TYPES } from '../../../infrastructure/bootstrap/types';
import { useAppId } from '../../../../../shared/hooks/use-app-context';

interface DailyRewardsProps {
  userId: string;
  // appId теперь получается автоматически из контекста приложения
}

export function DailyRewards({ userId }: DailyRewardsProps): JSX.Element {
  // Always call ALL hooks first, in the same order, BEFORE any conditions
  const appId = useAppId();
  const [presenter, setPresenter] = useState<DailyRewardsPresenter | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [currentViewModel, setCurrentViewModel] = useState<any>(null);

  const forceUpdate = useCallback(() => {
    setUpdateCounter(prev => prev + 1);
  }, []);

  // Initialize presenter from DI container - this useEffect must come AFTER all other hooks
  useEffect(() => {
    if (!presenter && appId) {
      try {
        console.log('DailyRewards: Attempting to get presenter from container...');
        const presenterInstance = container.get<DailyRewardsPresenter>(DAILY_REWARDS_TYPES.DailyRewardsPresenter);
        console.log('DailyRewards: Presenter instance:', presenterInstance);
        if (presenterInstance) {
          setPresenter(presenterInstance);
          console.log('DailyRewards: Presenter successfully initialized');
        } else {
          console.error('DailyRewards: Presenter instance is null/undefined');
          // Show error state
          setCurrentViewModel({
            status: 'error',
            canClaim: false,
            reward: null,
            lastClaimDate: null,
            nextClaimDate: null,
            successMessage: null,
            error: 'Failed to initialize presenter',
            isClaiming: false
          });
        }
      } catch (error) {
        console.error('DailyRewards: Failed to initialize presenter:', error);
        // Show error state
        setCurrentViewModel({
          status: 'error',
          canClaim: false,
          reward: null,
          lastClaimDate: null,
          nextClaimDate: null,
          successMessage: null,
          error: 'Failed to initialize presenter',
          isClaiming: false
        });
      }
    }
  }, [presenter, appId]);

  // Load reward availability
  useEffect(() => {
    console.log('[DailyRewards Component] useEffect triggered', { hasPresenter: !!presenter, userId, appId });
    if (presenter && appId) {
      console.log('[DailyRewards Component] Setting up presenter and loading rewards');
      presenter.setOnViewModelChanged(forceUpdate);
      presenter.loadRewardAvailability(userId, appId);
    } else {
      console.log('[DailyRewards Component] Presenter or appId not available yet', { hasPresenter: !!presenter, hasAppId: !!appId });
    }
  }, [presenter, userId, appId, forceUpdate]);

  console.log('[DailyRewards] Component rendered', { userId, appId, hasAppId: !!appId });

  // If appId is not loaded yet, show loading state
  if (!appId) {
    console.log('[DailyRewards] Showing loading state - appId not available');
    return (
      <div className="daily-rewards-card bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading daily rewards...</p>
        </div>
      </div>
    );
  }

  if (!presenter) {
    return (
      <div className="daily-rewards-card bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading daily rewards...</p>
        </div>
      </div>
    );
  }

  const viewModel = currentViewModel || presenter.getViewModel();

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'points':
        return '💰';
      case 'currency':
        return '🪙';
      case 'item':
        return '🎁';
      default:
        return '🎉';
    }
  };

  const formatTimeUntilNextClaim = (nextClaimDate: Date | null) => {
    if (!nextClaimDate) return '';

    const now = new Date();
    const diff = nextClaimDate.getTime() - now.getTime();

    if (diff <= 0) return 'Available now!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m until next reward`;
    }
    return `${minutes}m until next reward`;
  };

  return (
    <div className="daily-rewards-card bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Daily Reward
        </h2>
        {viewModel.reward && (
          <div className="text-sm opacity-90">
            {getRewardTypeIcon(viewModel.reward.type)} {viewModel.reward.points} points
          </div>
        )}
      </div>

      {viewModel.status === 'loading' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm opacity-90">Checking reward availability...</p>
        </div>
      )}

      {viewModel.status === 'loaded' && viewModel.reward && (
        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getRewardTypeIcon(viewModel.reward.type)}</span>
              <div>
                <h3 className="font-semibold text-lg">{viewModel.reward.title}</h3>
                <p className="text-sm opacity-90">{viewModel.reward.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
                <span className="font-medium">{viewModel.reward.points}</span>
                <span className="opacity-75"> points reward</span>
              </div>

              {viewModel.canClaim ? (
                <button
                  onClick={() => presenter.claimReward({ userId, appId })}
                  disabled={viewModel.isClaiming}
                  className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {viewModel.isClaiming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Claiming...
                    </>
                  ) : (
                    <>
                      <span>🎁</span>
                      Claim Reward
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">⏰ Already claimed today</div>
                  {viewModel.nextClaimDate && (
                    <div className="text-xs opacity-60">
                      {formatTimeUntilNextClaim(viewModel.nextClaimDate)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {viewModel.lastClaimDate && (
            <div className="text-xs opacity-75 text-center">
              Last claimed: {viewModel.lastClaimDate.toLocaleDateString()} at{' '}
              {viewModel.lastClaimDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {viewModel.status === 'claimed' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">Reward Claimed!</h3>
          {viewModel.successMessage && (
            <p className="text-sm opacity-90 mb-4">{viewModel.successMessage}</p>
          )}
          <button
            onClick={() => presenter.loadRewardAvailability(userId, appId)}
            className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Check Again
          </button>
        </div>
      )}

          {viewModel.status === 'error' && (
        <div className="text-center py-8">
          <div className="text-red-300 mb-4">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="font-semibold">Oops!</p>
            <p className="text-sm opacity-90">{viewModel.error}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => presenter.loadRewardAvailability(userId, appId)}
              className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                console.log('[TEST BUTTON] Presenter available:', !!presenter);
                if (presenter) {
                  console.log('[TEST BUTTON] Calling loadRewardAvailability');
                  presenter.loadRewardAvailability(userId, appId);
                }
              }}
              className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Test Load
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
