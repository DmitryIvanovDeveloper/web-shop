import { inject, injectable } from 'inversify';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/daily-rewards.container';
import type { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability-use-case.use-case';
import type { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward-use-case.use-case';
import type { CheckDailyRewardAvailabilityInput, DailyRewardAvailabilityOutput, ClaimDailyRewardInput, ClaimDailyRewardOutput } from '../../application/types/daily-reward.types';

export interface DailyRewardsViewModel {
  status: 'loading' | 'loaded' | 'claiming' | 'claimed' | 'error';
  canClaim: boolean;
  reward: {
    id: string;
    type: string;
    title: string;
    description: string;
    points: number;
  } | null;
  lastClaimDate: Date | null;
  nextClaimDate: Date | null;
  successMessage: string | null;
  error: string | null;
  isClaiming: boolean;
}

@injectable()
export class DailyRewardsPresenter {
  private _viewModel: DailyRewardsViewModel = {
    status: 'loading',
    canClaim: false,
    reward: null,
    lastClaimDate: null,
    nextClaimDate: null,
    successMessage: null,
    error: null,
    isClaiming: false
  };

  private _onViewModelChanged?: () => void;

  constructor(
    @inject(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase)
    private readonly _checkAvailabilityUseCase: CheckDailyRewardAvailabilityUseCase,
    @inject(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase)
    private readonly _claimRewardUseCase: ClaimDailyRewardUseCase
  ) {}

  getViewModel(): DailyRewardsViewModel {
    console.log('[DailyRewardsPresenter] getViewModel called', { status: this._viewModel.status, error: this._viewModel.error });
    return { ...this._viewModel };
  }

  setOnViewModelChanged(callback: () => void): void {
    this._onViewModelChanged = callback;
  }

  private updateViewModel(update: Partial<DailyRewardsViewModel>): void {
    console.log('[DailyRewardsPresenter] updateViewModel called', { update, currentStatus: this._viewModel.status });
    this._viewModel = { ...this._viewModel, ...update };
    console.log('[DailyRewardsPresenter] viewModel updated to', { newStatus: this._viewModel.status });
    this._onViewModelChanged?.();
  }

  async loadRewardAvailability(userId: string, appId: string = 'default-app'): Promise<void> {
    console.log('[DailyRewardsPresenter] loadRewardAvailability called', { userId, appId });
    this.updateViewModel({
      status: 'loading',
      error: null,
      successMessage: null
    });

    try {
      console.log('[DailyRewardsPresenter] About to execute use case');
      const result = await this._checkAvailabilityUseCase.execute({ userId, appId });
      console.log('[DailyRewardsPresenter] Use case result:', { isSuccess: result.isSuccess });

      if (result.isSuccess) {
        this.updateViewModel({
          status: 'loaded',
          canClaim: result.data.canClaim,
          reward: result.data.reward,
          lastClaimDate: result.data.lastClaimDate || null,
          nextClaimDate: result.data.nextClaimDate || null,
          error: null
        });
      } else {
        this.updateViewModel({
          status: 'error',
          error: result.error.message,
          canClaim: false,
          reward: null
        });
      }
    } catch (error) {
      this.updateViewModel({
        status: 'error',
        error: 'Failed to load reward availability',
        canClaim: false,
        reward: null
      });
    }
  }

  async claimReward(userId: string, appId: string = 'default-app'): Promise<void> {
    if (!this._viewModel.canClaim || this._viewModel.isClaiming) return;

    this.updateViewModel({
      isClaiming: true,
      error: null,
      successMessage: null
    });

    try {
      const result = await this._claimRewardUseCase.execute({ userId, appId });

      if (result.isSuccess) {
        this.updateViewModel({
          status: 'claimed',
          canClaim: false,
          isClaiming: false,
          successMessage: result.data.message,
          lastClaimDate: new Date(),
          error: null
        });
      } else {
        this.updateViewModel({
          status: 'error',
          error: result.error.message,
          isClaiming: false,
          successMessage: null
        });
      }
    } catch (error) {
      this.updateViewModel({
        status: 'error',
        error: 'Failed to claim reward',
        isClaiming: false,
        successMessage: null
      });
    }
  }
}
