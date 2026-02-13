import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
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
            const allRewardsResult = await this._dailyRewardRepository.findAllRewards(input.appId);
      if (allRewardsResult.isFailure) {
        return Result.error(allRewardsResult.error);
      }

      const allRewards = allRewardsResult.value!;
      if (!allRewards || allRewards.length === 0) {
        return Failure.fail(new RewardNotAvailableError());
      }

            const lastClaimResult = await this._rewardClaimRepository.findLastClaimByUser(input.userId);
      if (lastClaimResult.isFailure) {
        return Result.error(lastClaimResult.error);
      }

      const lastClaim = lastClaimResult.value;

            if (lastClaim && lastClaim.isFromToday()) {
        return Result.error(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
      }

      let reward;

            if (input.rewardId) {
        const requestedRewardId = RewardId.fromString(input.rewardId);
        reward = allRewards.find(r => r.id.equals(requestedRewardId));
        
        if (!reward) {
          return Failure.fail(new RewardNotAvailableError());
        }

                if (!reward.canBeClaimedBy(input.userId, lastClaim?.claimedAt)) {
          if (lastClaim) {
            return Result.error(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
          }
          return Failure.fail(new RewardNotAvailableError());
        }
      } else {
                let nextDayNumber: number;
        if (!lastClaim) {
                    nextDayNumber = 1;
        } else {
                    const lastClaimedReward = allRewards.find(r => r.id.value === lastClaim.rewardId.value);
          if (!lastClaimedReward || lastClaimedReward.dayNumber === null) {
                        nextDayNumber = 1;
          } else {
                        nextDayNumber = lastClaimedReward.dayNumber + 1;
          }
        }

                reward = allRewards.find(r => r.dayNumber === nextDayNumber);
        if (!reward) {
          return Failure.fail(new RewardNotAvailableError());
        }

                if (!reward.canBeClaimedBy(input.userId, lastClaim?.claimedAt)) {
                    if (lastClaim) {
            return Result.error(new RewardAlreadyClaimedTodayError(input.userId, lastClaim.claimedAt));
          }
                    return Failure.fail(new RewardNotAvailableError());
        }
      }

            const claimId = ClaimId.create(crypto.randomUUID());
      const claim = DailyRewardClaim.create(
        claimId,
        input.userId,
        reward.id,
        reward.points
      );

            const saveResult = await this._rewardClaimRepository.save(claim);
      if (saveResult.isFailure) {
        return Result.error(saveResult.error);
      }

            let nextRewardId: string | null = null;
      let nextClaimDate: Date | null = null;

      if (reward.dayNumber !== null) {
                const nextReward = allRewards.find(r => r.dayNumber === reward.dayNumber + 1);
        if (nextReward) {
          nextRewardId = nextReward.id.value;
        }
      } else if (allRewards.length > 0) {
                nextRewardId = allRewards[0].id.value;
      }

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

      return Result.ok(output);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
