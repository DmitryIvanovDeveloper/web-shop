import { inject, injectable } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { RewardClaimRepositoryPort } from '../ports/reward-claim-repository.port';
import type { CheckDailyRewardAvailabilityInput, DailyRewardAvailabilityOutput } from '../types/daily-reward.types';
import { RewardNotAvailableError } from '../../domain';

@injectable()
export class CheckDailyRewardAvailabilityUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort,
    @inject(DAILY_REWARDS_TYPES.RewardClaimRepository)
    private readonly _rewardClaimRepository: RewardClaimRepositoryPort
  ) {}

  async execute(input: CheckDailyRewardAvailabilityInput): Promise<Result<DailyRewardAvailabilityOutput, Error>> {
    try {
      console.log('[CheckDailyRewardAvailabilityUseCase] Executing', { appId: input.appId });

      // Get active daily reward
      console.log('[CheckDailyRewardAvailabilityUseCase] Calling repository.findActiveReward');
      const rewardResult = await this._dailyRewardRepository.findActiveReward(input.appId);
      console.log('[CheckDailyRewardAvailabilityUseCase] Repository result:', { success: rewardResult.success });

      if (isFailure(rewardResult)) {
        console.error('[CheckDailyRewardAvailabilityUseCase] Repository failed:', rewardResult.error);
        return Failure.fail(rewardResult.error);
      }

      const reward = rewardResult.data;
      if (!reward) {
        return Failure.fail(new RewardNotAvailableError());
      }

      // Check if user already claimed today
      const lastClaimResult = await this._rewardClaimRepository.findLastClaimByUser(input.userId);
      if (isFailure(lastClaimResult)) {
        return Failure.fail(lastClaimResult.error);
      }

      const lastClaim = lastClaimResult.data;
      const canClaim = reward.canBeClaimedBy(input.userId, lastClaim?.claimedAt);

      const output: DailyRewardAvailabilityOutput = {
        canClaim,
        reward: this.mapRewardToOutput(reward),
        lastClaimDate: lastClaim?.claimedAt
      };

      if (!canClaim && lastClaim) {
        // Calculate next claim date (tomorrow at midnight)
        const nextClaimDate = new Date(lastClaim.claimedAt);
        nextClaimDate.setDate(nextClaimDate.getDate() + 1);
        nextClaimDate.setHours(0, 0, 0, 0);
        output.nextClaimDate = nextClaimDate;
      }

      return Success.ok(output);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRewardToOutput(reward: any): any {
    return {
      id: reward.id.value,
      type: reward.type.value,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      isActive: reward.isActive,
      createdAt: reward.createdAt.toISOString(),
      updatedAt: reward.updatedAt.toISOString()
    };
  }
}
