import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { LoadDailyRewardsUseCase } from '../../application/use-cases/load-daily-rewards.use-case';
import type { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward.use-case';
import type { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability.use-case';
import type { LoadDailyRewardsInput, DailyRewardOutput, ClaimDailyRewardInput } from '../../application/types/daily-reward.types';
import type { Logger } from '../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { DailyRewardCardViewModelImpl, type DailyRewardViewModel } from '../view-models/daily-reward.view-model';

type ViewModelUpdateCallback = () => void;

interface DailyRewardsInternalState {
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly rewards: readonly DailyRewardViewModel[];
  readonly userId?: string;
}

@injectable()
export class DailyRewardsPresenter {
  private _viewModel: DailyRewardsInternalState = {
    isLoading: false,
    errorMessage: null,
    rewards: [],
    userId: undefined
  };
  private _subscribers: Set<ViewModelUpdateCallback> = new Set();

  private _labels = {
    pageTitle: 'Daily Rewards',
    loading: 'Loading daily rewards...',
    error: 'Error loading daily rewards',
    noRewards: 'No daily rewards available',
    claimButton: 'Claim Reward',
    claimedButton: 'Claimed',
    claiming: 'Claiming...',
    dayPrefix: 'DAY',
    active: 'Active',
    inactive: 'Inactive',
    points: 'Points',
    currency: 'Currency',
    item: 'Item',
    alreadyClaimed: 'You have already claimed your daily reward today. Please come back tomorrow!'
  };

  public get labels() {
    return { ...this._labels };
  }

  public readonly state: { loading: boolean; error: string | null; data: unknown } = { loading: false, error: null, data: null };

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

  public get rewards(): DailyRewardViewModel[] {
    return [...this._viewModel.rewards];
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

  
  public updateLabelsFromTranslations(translations: Record<string, string>): void {
    this._labels = {
      pageTitle: translations['dailyRewards.pageTitle'] || translations['dailyRewards.title'] || 'Daily Rewards',
      loading: translations['dailyRewards.loading'] || 'Loading daily rewards...',
      error: translations['dailyRewards.error'] || 'Error loading daily rewards',
      noRewards: translations['dailyRewards.noRewards'] || 'No daily rewards available',
      claimButton: translations['dailyRewards.claimButton'] || 'Claim Reward',
      claimedButton: translations['dailyRewards.claimedButton'] || 'Claimed',
      claiming: translations['dailyRewards.claiming'] || 'Claiming...',
      dayPrefix: translations['dailyRewards.dayPrefix'] || 'DAY',
      active: translations['dailyRewards.active'] || 'Active',
      inactive: translations['dailyRewards.inactive'] || 'Inactive',
      points: translations['dailyRewards.points'] || 'Points',
      currency: translations['dailyRewards.currency'] || 'Currency',
      item: translations['dailyRewards.item'] || 'Item',
      alreadyClaimed: translations['dailyRewards.alreadyClaimed'] || 'You have already claimed your daily reward today. Please come back tomorrow!'
    };

    this._logger.info('[DailyRewardsPresenter] Labels updated from translations');
    this._notifySubscribers();
  }

  public async loadRewards(input: LoadDailyRewardsInput): Promise<void> {
    this._logger.info('[DailyRewardsPresenter] Loading rewards', { appId: input.appId, userId: input.userId });

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

    if (result.isFailure) {
      this._logger.error('[DailyRewardsPresenter] Failed to load rewards', { error: result.error });
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: result.error?.message ?? 'Failed to load daily rewards',
      };
      this._notifySubscribers();
      return;
    }

    let rewards = result.value?.rewards ?? [];

        if (input.userId) {
      try {
      rewards = await this.enrichRewardsWithClaimStatus(rewards, input.userId, input.appId);
      } catch (error) {
        this._logger.warn('[DailyRewardsPresenter] Failed to enrich rewards with claim status, using defaults', { error });
                rewards = rewards.map(r => ({ ...r, isActive: false, isClaimedToday: false }));
      }
    }

        const viewModels = rewards.map(reward => {
      const viewModel = DailyRewardCardViewModelImpl.create({
        id: reward.id,
        type: reward.type as 'points' | 'currency' | 'item',
        title: reward.title,
        description: reward.description,
        points: reward.points,
        dayNumber: reward.dayNumber ?? null,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
        isActive: reward.isActive,
        isClaimedToday: reward.isClaimedToday || false,
        isClaiming: false
      });
            viewModel.setOnCountdownUpdate(() => {
        this._notifySubscribers();
      });
      return viewModel;
    });

        if (input.userId) {
      try {
        const availabilityResult = await this._checkDailyRewardAvailabilityUseCase.execute({
          userId: input.userId,
          appId: input.appId
        });

        if (availabilityResult.isSuccess) {
          const availability = availabilityResult.value!;
          if (availability.nextClaimDate && !availability.canClaim && availability.reward) {
                        const nextRewardViewModel = viewModels.find(vm => vm.id === availability.reward?.id);
            if (nextRewardViewModel && nextRewardViewModel instanceof DailyRewardCardViewModelImpl) {
              this._logger.info('[DailyRewardsPresenter] Setting nextClaimDate during load:', {
                rewardId: availability.reward.id,
                nextClaimDate: availability.nextClaimDate
              });
              nextRewardViewModel.setNextClaimDate(new Date(availability.nextClaimDate));
            }
          }
        }
      } catch (error) {
        this._logger.warn('[DailyRewardsPresenter] Failed to set nextClaimDate during load:', error);
      }
    }

        this._viewModel = {
      ...this._viewModel,
      isLoading: false,
      rewards: viewModels,
      errorMessage: null,
    };
    this._notifySubscribers();

    this._logger.info('[DailyRewardsPresenter] Successfully loaded rewards', {
      appId: input.appId,
      count: rewards.length
    });
  }

  private async enrichRewardsWithClaimStatus(rewards: DailyRewardOutput[], userId: string, appId: string): Promise<DailyRewardOutput[]> {
    try {
      const availabilityResult = await this._checkDailyRewardAvailabilityUseCase.execute({
        userId,
        appId
      });

      if (availabilityResult.isSuccess) {
        const availability = availabilityResult.data;
        const nextReward = availability.reward;

        this._logger.info('[DailyRewardsPresenter] Availability check result', {
          hasNextReward: !!nextReward,
          nextRewardId: nextReward?.id,
          canClaim: availability.canClaim,
          rewardsCount: rewards.length
        });

        const lastClaimRewardId = availability.lastClaimRewardId;
        const lastClaimDate = availability.lastClaimDate;
        const isLastClaimToday = lastClaimDate && new Date(lastClaimDate).toDateString() === new Date().toDateString();

        if (nextReward) {
          this._logger.info('[DailyRewardsPresenter] Processing nextReward', {
            nextRewardId: nextReward.id,
            nextRewardTitle: nextReward.title,
            canClaim: availability.canClaim,
            totalRewards: rewards.length,
            rewardIds: rewards.map(r => r.id).slice(0, 5)
          });

          const enrichedRewards = rewards.map(reward => {
            const isNextReward = reward.id === nextReward.id;
            const isLastClaimedReward = lastClaimRewardId && reward.id === lastClaimRewardId;

                        const isActive = isNextReward && availability.canClaim;

            const isClaimedToday = isLastClaimedReward && isLastClaimToday ? true : false;

            if (isNextReward) {
              this._logger.info(`[DailyRewardsPresenter] Found nextReward match: ${reward.id}`, {
                isActive,
                canClaim: availability.canClaim,
                isClaimedToday
              });
            }
            
            return {
              ...reward,
              isActive: isActive,
              isClaimedToday: isClaimedToday
            };
          });

          const activeRewards = enrichedRewards.filter(r => r.isActive);
          this._logger.info('[DailyRewardsPresenter] Enriched rewards result', {
            totalRewards: enrichedRewards.length,
            activeRewards: activeRewards.length,
            activeRewardIds: activeRewards.map(r => r.id)
          });

          return enrichedRewards;
        } else {
          this._logger.warn('[DailyRewardsPresenter] No next reward found in availability result', {
            lastClaimRewardId,
            lastClaimDate,
            isLastClaimToday
          });
          
                    const hasNoClaims = !lastClaimRewardId && !lastClaimDate;
          const firstReward = rewards.find(r => r.dayNumber === 1);
          
          return rewards.map(reward => {
            const isLastClaimedReward = lastClaimRewardId && reward.id === lastClaimRewardId;
            const isFirstReward = firstReward && reward.id === firstReward.id;
            
                        const isActive = !!(hasNoClaims && isFirstReward && availability.canClaim);
            
            return {
              ...reward,
              isActive: isActive,
              isClaimedToday: isLastClaimedReward && isLastClaimToday ? true : false
            };
          });
        }
      } else {
        this._logger.warn('[DailyRewardsPresenter] Availability check failed', {
          error: availabilityResult.error?.message
        });
      }
    } catch (error) {
      this._logger.warn('[DailyRewardsPresenter] Failed to check claim status', { error });

            return rewards.map(reward => ({
        ...reward,
        isActive: reward.dayNumber === 1,         isClaimedToday: false
      }));
    }

        return rewards.map(reward => ({
      ...reward,
      isActive: false,
      isClaimedToday: false
    }));
  }

  public async claimReward(input: ClaimDailyRewardInput): Promise<void> {
    this._logger.info('[DailyRewardsPresenter] Claiming reward', { 
      userId: input.userId, 
      appId: input.appId,
      rewardId: input.rewardId 
    });

        let rewardId = input.rewardId;
    if (!rewardId) {
      try {
        const availabilityResult = await this._checkDailyRewardAvailabilityUseCase.execute({
          userId: input.userId,
          appId: input.appId
        });
        if (!availabilityResult.isFailure && availabilityResult.value.reward) {
          rewardId = availabilityResult.value.reward.id;
          this._logger.info('[DailyRewardsPresenter] Will claim reward', { rewardId });
        }
      } catch (error) {
        this._logger.warn('[DailyRewardsPresenter] Failed to determine claiming reward ID', { error });
      }
    }

        if (rewardId) {
      const rewardViewModel = this._viewModel.rewards.find(r => r.id === rewardId);
      if (rewardViewModel && rewardViewModel instanceof DailyRewardCardViewModelImpl) {
        rewardViewModel.setIsClaiming(true);
        this._notifySubscribers();
      }
    }

    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    };
    this._notifySubscribers();

    try {
      const result = await this._claimDailyRewardUseCase.execute(input);

      if (result.isFailure) {
                this._logger.error('[DailyRewardsPresenter] Failed to claim reward', { 
          error: result.error,
          userId: input.userId,
          appId: input.appId
        });

        const isAlreadyClaimedError = result.error!.message.includes('already claimed') ||
                                     result.error!.message.includes('has already claimed') ||
                                     result.error!.name === 'RewardAlreadyClaimedTodayError';

                this._viewModel.rewards.forEach(reward => {
          if (reward instanceof DailyRewardCardViewModelImpl) {
            reward.setIsClaiming(false);
          }
        });

        if (isAlreadyClaimedError) {
          this._logger.info('[DailyRewardsPresenter] User already claimed reward today, reloading rewards');
          this._viewModel = {
            ...this._viewModel,
            errorMessage: this._labels.alreadyClaimed,
          };
          this._notifySubscribers();
          await this.loadRewards({ appId: input.appId, userId: input.userId });
          this._viewModel = {
            ...this._viewModel,
            errorMessage: null,
          };
        } else {
          this._viewModel = {
            ...this._viewModel,
            isLoading: false,
            errorMessage: result.error!.message || 'Failed to claim reward. Please try again.',
          };
          this._notifySubscribers();
        }
      } else {
                this._logger.info('[DailyRewardsPresenter] Successfully claimed reward', result.value);
        
                this._viewModel.rewards.forEach(reward => {
          if (reward instanceof DailyRewardCardViewModelImpl) {
            reward.setIsClaiming(false);
          }
        });
        
                if (result.value.nextRewardId && result.value.nextClaimDate) {
                    const nextRewardViewModel = this._viewModel.rewards.find(r => r.id === result.value.nextRewardId);
          if (nextRewardViewModel && nextRewardViewModel instanceof DailyRewardCardViewModelImpl) {
            const nextClaimDate = new Date(result.data.nextClaimDate);
            nextRewardViewModel.setNextClaimDate(nextClaimDate);

                                    nextRewardViewModel.setOnCountdownUpdate(() => {
                            this._notifySubscribers();
            });

                        this._notifySubscribers();
          } else {
                      }
        }
        
        this._viewModel = {
          ...this._viewModel,
          errorMessage: null,
        };
        await this.loadRewards({ appId: input.appId, userId: input.userId });
      }
    } catch (error) {
            this._viewModel.rewards.forEach(reward => {
        if (reward instanceof DailyRewardCardViewModelImpl) {
          reward.setIsClaiming(false);
        }
      });
      
      this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      this._logger.error('[DailyRewardsPresenter] Unexpected error claiming reward', { error });
      this._notifySubscribers();
    }
  }

    public setOnViewModelChanged(callback: () => void): void {
    this.subscribe(callback);
  }

  public getViewModel() {
    const hasClaiming = this._viewModel.rewards.some(r => r.isClaiming);
    return {
      status: this._viewModel.isLoading ? 'loading' : 
             hasClaiming ? 'claiming' :
             this._viewModel.errorMessage ? 'error' : 'loaded',
      reward: this._viewModel.rewards[0] || null,
      nextClaimDate: null as Date | null
    };
  }

  public async loadRewardAvailability(userId: string, appId: string): Promise<void> {
    await this.loadRewards({ appId, userId });
  }

  public async onCheckDailyRewardAvailability(input: { userId: string; appId: string }): Promise<void> {
    await this.loadRewards({ appId: input.appId, userId: input.userId });
  }

  public async onClaimDailyReward(input: ClaimDailyRewardInput): Promise<void> {
    await this.claimReward(input);
  }
}
