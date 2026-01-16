import { inject, injectable } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { RewardClaimRepositoryPort } from '../ports/reward-claim-repository.port';
import type { ClaimDailyRewardInput, ClaimDailyRewardOutput } from '../types/daily-reward.types';
import { DailyRewardClaim, ClaimId, RewardId, RewardAlreadyClaimedTodayError, RewardNotAvailableError } from '../../domain';

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
      // Get all rewards
      const allRewardsResult = await this._dailyRewardRepository.findAllRewards(input.appId);
      if (isFailure(allRewardsResult)) {
        return Failure.fail(allRewardsResult.error);
      }

      const allRewards = allRewardsResult.data;
      if (!allRewards || allRewards.length === 0) {
        return Failure.fail(new RewardNotAvailableError());
      }

      // Get last claim by user
      const lastClaimResult = await this._rewardClaimRepository.findLastClaimByUser(input.userId);
      if (isFailure(lastClaimResult)) {
        return Failure.fail(lastClaimResult.error);
      }

      const lastClaim = lastClaimResult.data;

      // Check if user already claimed today
      if (lastClaim && lastClaim.isFromToday()) {
        return Failure.fail(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
      }

      let reward;

      // If rewardId is provided, use it directly
      if (input.rewardId) {
        const requestedRewardId = RewardId.fromString(input.rewardId);
        reward = allRewards.find(r => r.id.equals(requestedRewardId));
        
        if (!reward) {
          return Failure.fail(new RewardNotAvailableError());
        }

        // Verify the requested reward can be claimed
        if (!reward.canBeClaimedBy(input.userId, lastClaim?.claimedAt)) {
          if (lastClaim) {
            return Failure.fail(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
          }
          return Failure.fail(new RewardNotAvailableError());
        }
      } else {
        // If rewardId is not provided, determine next reward based on day_number (legacy behavior)
        let nextDayNumber: number;
        if (!lastClaim) {
          // No claims yet, start with DAY 1
          nextDayNumber = 1;
        } else {
          // Find the reward that was claimed
          const lastClaimedReward = allRewards.find(r => r.id.value === lastClaim.rewardId.value);
          if (!lastClaimedReward || lastClaimedReward.dayNumber === null) {
            // If last claimed reward doesn't have day_number, start from DAY 1
            nextDayNumber = 1;
          } else {
            // Next reward is the day after the last claimed one
            nextDayNumber = lastClaimedReward.dayNumber + 1;
          }
        }

        // Find the reward with the next day_number
        reward = allRewards.find(r => r.dayNumber === nextDayNumber);
        if (!reward) {
          return Failure.fail(new RewardNotAvailableError());
        }

        // Verify the reward can be claimed
        if (!reward.canBeClaimedBy(input.userId, lastClaim?.claimedAt)) {
          // If canBeClaimedBy returns false, lastClaim must exist and be from today
          if (lastClaim) {
            return Failure.fail(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
          }
          // This should not happen, but handle it gracefully
          return Failure.fail(new RewardNotAvailableError());
        }
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
      if (isFailure(saveResult)) {
        return Failure.fail(saveResult.error);
      }

      // Determine next reward
      let nextRewardId: string | null = null;
      let nextClaimDate: Date | null = null;

      if (reward.dayNumber !== null) {
        // Find next reward by day_number
        const nextReward = allRewards.find(r => r.dayNumber === reward.dayNumber + 1);
        if (nextReward) {
          nextRewardId = nextReward.id.value;
        }
      } else if (allRewards.length > 0) {
        // If no day_number, use first reward
        nextRewardId = allRewards[0].id.value;
      }

      // Calculate next claim date (tomorrow at midnight)
      if (nextRewardId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        nextClaimDate = tomorrow;
      }

      const output: ClaimDailyRewardOutput = {
        success: true,
        pointsAwarded: reward.points,
        claimId: claim.id.value,
        message: `Successfully claimed ${reward.points} points!`,
        nextRewardId,
        nextClaimDate
      };

      return Success.ok(output);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
