import { inject, injectable } from 'inversify';
import { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward.use-case';
import { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability.use-case';
import { isSuccess } from '../../../../shared/result/result';
import type { CheckDailyRewardAvailabilityInput, ClaimDailyRewardInput } from '../../application/types/daily-reward.types';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class DailyRewardsPresenter {
  public readonly labels = { add: 'Add', update: 'Update', delete: 'Delete', list: 'List' } as const;
  public state: { loading: boolean; error: string | null; data: unknown } = { loading: false, error: null, data: null };
  private viewModel = { status: 'idle' as 'idle' | 'loading' | 'loaded' | 'error' | 'claiming', reward: null as any, nextClaimDate: null as Date | null };
  private onViewModelChanged?: () => void;

  constructor(
    @inject(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase)
    private readonly checkDailyRewardAvailabilityUseCase: CheckDailyRewardAvailabilityUseCase,
    @inject(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase)
    private readonly claimDailyRewardUseCase: ClaimDailyRewardUseCase
  ) {}

  public setOnViewModelChanged(callback: () => void): void {
    this.onViewModelChanged = callback;
  }

  public getViewModel() {
    return this.viewModel;
  }

  public async loadRewardAvailability(userId: string, appId: string): Promise<void> {
    this.viewModel = { ...this.viewModel, status: 'loading' };
    this.onViewModelChanged?.();

    try {
      const result = await this.checkDailyRewardAvailabilityUseCase.execute({
        userId,
        appId
      });

      if (!isSuccess(result)) {
        this.viewModel = {
          ...this.viewModel,
          status: 'error',
          reward: null,
          nextClaimDate: null
        };
      } else {
        this.viewModel = {
          ...this.viewModel,
          status: 'loaded',
          reward: result.data?.reward || null,
          nextClaimDate: result.data?.nextClaimDate || null
        };
      }
    } catch (error) {
      this.viewModel = {
        ...this.viewModel,
        status: 'error',
        reward: null,
        nextClaimDate: null
      };
    }

    this.onViewModelChanged?.();
  }

  public async claimReward(userId: string, appId: string): Promise<void> {
    this.viewModel = { ...this.viewModel, status: 'claiming' };
    this.onViewModelChanged?.();

    try {
      const result = await this.claimDailyRewardUseCase.execute({
        userId,
        appId
      });

      if (isSuccess(result)) {
        // Reload availability after successful claim
        await this.loadRewardAvailability(userId, appId);
      } else {
        this.viewModel = { ...this.viewModel, status: 'error' };
        this.onViewModelChanged?.();
      }
    } catch (error) {
      this.viewModel = { ...this.viewModel, status: 'error' };
      this.onViewModelChanged?.();
    }
  }

  public async onCheckDailyRewardAvailability(input: CheckDailyRewardAvailabilityInput): Promise<void> {
    const result = await this.checkDailyRewardAvailabilityUseCase.execute(input);
    if (!isSuccess(result)) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onClaimDailyReward(input: ClaimDailyRewardInput): Promise<void> {
    const result = await this.claimDailyRewardUseCase.execute(input);
    if (!isSuccess(result)) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }
}
