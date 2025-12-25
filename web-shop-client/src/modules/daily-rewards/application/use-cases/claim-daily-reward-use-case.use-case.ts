import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { RewardClaimRepositoryPort } from '../ports/reward-claim-repository.port';
import type { ClaimDailyRewardInput, ClaimDailyRewardOutput } from '../types/daily-reward.types';
import { DailyRewardClaim, ClaimId, RewardAlreadyClaimedTodayError, RewardNotAvailableError } from '../../domain';

@injectable()
export class ClaimDailyRewardUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort,
    @inject(DAILY_REWARDS_TYPES.RewardClaimRepository)
    private readonly _rewardClaimRepository: RewardClaimRepositoryPort
  ) {}

  async execute(input: ClaimDailyRewardInput): Promise<Result<ClaimDailyRewardOutput, Error>> {
    try {
      // Get active daily reward
      const rewardResult = await this._dailyRewardRepository.findActiveReward(input.appId);
      if (!rewardResult.isSuccess) {
        return Failure.fail(rewardResult.error);
      }

      const reward = rewardResult.data;
      if (!reward) {
        return Failure.fail(new RewardNotAvailableError());
      }

      // Check if user already claimed today
      const lastClaimResult = await this._rewardClaimRepository.findLastClaimByUser(input.userId);
      if (!lastClaimResult.isSuccess) {
        return Failure.fail(lastClaimResult.error);
      }

      const lastClaim = lastClaimResult.data;
      if (lastClaim && lastClaim.isFromToday()) {
        return Failure.fail(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
      }

      // Create new claim
      const claimId = ClaimId.create(crypto.randomUUID());
      const claim = DailyRewardClaim.create(
        claimId,
        input.userId,
        reward.id,
        reward.points
      );

      // Save claim
      const saveResult = await this._rewardClaimRepository.save(claim);
      if (!saveResult.isSuccess) {
        return Failure.fail(saveResult.error);
      }

      const output: ClaimDailyRewardOutput = {
        success: true,
        pointsAwarded: reward.points,
        claimId: claim.id.value,
        message: `Successfully claimed ${reward.points} points!`
      };

      return Success.ok(output);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
