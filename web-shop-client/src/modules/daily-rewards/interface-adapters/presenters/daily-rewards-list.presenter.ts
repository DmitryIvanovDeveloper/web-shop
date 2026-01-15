import { inject, injectable } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { LoadDailyRewardsUseCase } from '../../application/use-cases/load-daily-rewards.use-case';
import type { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward.use-case';
import type { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability.use-case';
import type { LoadDailyRewardsInput, DailyRewardOutput, ClaimDailyRewardInput } from '../../application/types/daily-reward.types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';

type ViewModelUpdateCallback = () => void;

export interface DailyRewardsListViewModel {
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly rewards: readonly DailyRewardOutput[];
  readonly userId?: string;
}

export interface DailyRewardListItemViewModel {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly points: number;
  readonly isActive: boolean;
  readonly isClaimedToday: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly typeIcon: string;
  readonly statusBadge: {
    text: string;
    backgroundColor: string;
    color: string;
  };
}

@injectable()
export class DailyRewardsListPresenter {
  private _viewModel: DailyRewardsListViewModel = {
    isLoading: false,
    errorMessage: null,
    rewards: [],
    userId: undefined
  };
  private _subscribers: Set<ViewModelUpdateCallback> = new Set();

  public readonly labels = {
    pageTitle: 'Daily Rewards',
    loading: 'Loading daily rewards...',
    error: 'Error loading daily rewards',
    noRewards: 'No daily rewards available',
    points: 'points'
  };

  constructor(
    @inject(DAILY_REWARDS_TYPES.LoadDailyRewardsUseCase)
    private readonly _loadDailyRewardsUseCase: LoadDailyRewardsUseCase,
    @inject(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase)
    private readonly _claimDailyRewardUseCase: ClaimDailyRewardUseCase,
    @inject(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase)
    private readonly _checkDailyRewardAvailabilityUseCase: CheckDailyRewardAvailabilityUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public subscribe(callback: ViewModelUpdateCallback): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => callback());
  }

  public getViewModel(): DailyRewardsListViewModel {
    return this._viewModel;
  }

  public get rewards(): DailyRewardListItemViewModel[] {
    return this._viewModel.rewards.map(reward => this.mapToListItemViewModel(reward));
  }

  public get isLoading(): boolean {
    return this._viewModel.isLoading;
  }

  public get error(): string | null {
    return this._viewModel.errorMessage;
  }

  public get hasRewards(): boolean {
    return this._viewModel.rewards.length > 0;
  }

  public setUserId(userId: string): void {
    this._viewModel = {
      ...this._viewModel,
      userId
    };
  }

  public async loadRewards(input: LoadDailyRewardsInput): Promise<void> {
    this._logger.info('[DailyRewardsListPresenter] Loading rewards', { appId: input.appId, userId: input.userId });

    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    const loadInput = {
      appId: input.appId,
      userId: input.userId
    };
    const result = await this._loadDailyRewardsUseCase.execute(loadInput);

    if (isFailure(result)) {
      this._logger.error('[DailyRewardsListPresenter] Failed to load rewards', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to load daily rewards',
      };
      this._notifySubscribers();
      return;
    }

    let rewards = result.data?.rewards ?? [];

    // Check claim status for the active reward if userId is provided
    if (input.userId) {
      rewards = await this.enrichRewardsWithClaimStatus(rewards, input.userId, input.appId);
    }

    this._viewModel = {
      ...this._viewModel,
      isLoading: false,
      rewards: rewards,
      errorMessage: null,
    };
    this._notifySubscribers();

    this._logger.info('[DailyRewardsListPresenter] Successfully loaded rewards', {
      appId: input.appId,
      count: rewards.length
    });
  }

  private mapToListItemViewModel(reward: DailyRewardOutput): DailyRewardListItemViewModel {
    return {
      id: reward.id,
      type: reward.type,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      isActive: reward.isActive,
      isClaimedToday: reward.isClaimedToday || false,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
      typeIcon: this.getTypeIcon(reward.type),
      statusBadge: this.getStatusBadge(reward.isActive)
    };
  }

  private getTypeIcon(type: string): string {
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
  }

  private async enrichRewardsWithClaimStatus(rewards: DailyRewardOutput[], userId: string, appId: string): Promise<DailyRewardOutput[]> {
    try {
      // Check availability for this user
      const availabilityResult = await this._checkDailyRewardAvailabilityUseCase.execute({
        userId,
        appId
      });

      if (!isFailure(availabilityResult)) {
        const availability = availabilityResult.data;

        // Mark the active reward as claimed if user already claimed today
        return rewards.map(reward => ({
          ...reward,
          isClaimedToday: !availability.canClaim && reward.id === availability.reward?.id
        }));
      }
    } catch (error) {
      this._logger.warn('[DailyRewardsListPresenter] Failed to check claim status', { error });
    }

    return rewards;
  }

  public async claimReward(input: ClaimDailyRewardInput): Promise<void> {
    this._logger.info('[DailyRewardsListPresenter] Claiming reward', { userId: input.userId, appId: input.appId });

    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    try {
      const result = await this._claimDailyRewardUseCase.execute(input);

      if (isFailure(result)) {
        // Check if it's an "already claimed" error - in this case, don't show error, just reload
        const isAlreadyClaimedError = result.error.message.includes('already claimed') ||
                                     result.error.message.includes('has already claimed');

        if (isAlreadyClaimedError) {
          this._logger.info('[DailyRewardsListPresenter] User already claimed reward today, reloading rewards');
          await this.loadRewards({ appId: input.appId });
        } else {
          this._viewModel = {
            ...this._viewModel,
            isLoading: false,
            errorMessage: result.error.message,
          };
          this._logger.error('[DailyRewardsListPresenter] Failed to claim reward', { error: result.error });
        }
      } else {
        this._logger.info('[DailyRewardsListPresenter] Successfully claimed reward', result.data);
        // Reload rewards to reflect changes
        await this.loadRewards({ appId: input.appId });
      }
    } catch (error) {
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      this._logger.error('[DailyRewardsListPresenter] Unexpected error claiming reward', { error });
    }

    this._notifySubscribers();
  }

  private getStatusBadge(isActive: boolean): { text: string; backgroundColor: string; color: string } {
    if (isActive) {
      return {
        text: 'Active',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22C55E'
      };
    } else {
      return {
        text: 'Inactive',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444'
      };
    }
  }
}
